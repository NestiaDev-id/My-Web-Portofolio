import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { verifyJWT } from "@/lib/security/jwt"; // Gunakan verifyJWT yang asli
import { verifyCSRFToken } from "@/lib/security/csrf";

// Konfigurasi matcher Next.js untuk medeteksi rute yang perlu dilindungi
export const config = {
  matcher: ["/profile", "/blog/:path*", "/projects", "/social", "/about", "/"],
  runtime: "nodejs",
};

// Middleware Auth + CSRF untuk path tertentu
export default function withAuth(
  middleware: NextMiddleware,
  requireAuthPaths: string[] = []
) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;
    const needsAuth = requireAuthPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (needsAuth) {
      const token = req.cookies.get("token")?.value;
      const csrfToken = req.cookies.get("csrfToken")?.value;
      console.log("Token:", token);
      console.log("CSRF Token:", csrfToken);

      // ⛔ Token tidak ada → redirect ke login
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(loginUrl);
      }

      // Verifikasi JWT
      try {
        const jwtPayload = await verifyJWT(token); // Gunakan verifyJWT yang asli
        if (!jwtPayload || typeof jwtPayload !== "object") {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Lanjutkan verifikasi dan inject informasi ke request
        const { userId, jti: sessionId } = jwtPayload as {
          userId: string;
          jti: string;
        };

        // Inject data user ke request
        (req as any).user = { userId, sessionId };

        // Verifikasi CSRF token jika diperlukan (skip untuk safe methods)
        const method = req.method.toUpperCase();
        const safeMethod =
          method === "GET" || method === "HEAD" || method === "OPTIONS";

        let csrfValid = true;
        if (!safeMethod) {
          csrfValid = !!(
            csrfToken &&
            verifyCSRFToken(csrfToken, {
              expectedUserId: userId,
              expectedSessionId: sessionId,
              usedNonces: new Set(), // Gunakan store bersama di produksi seperti Redis
              nonce: req.headers.get("x-csrf-token") ?? "",
            })
          );
        }

        if (!csrfValid) {
          return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
          );
        }
      } catch (error) {
        console.error("Token verification failed", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // Pastikan bahwa `middleware` yang diteruskan selalu mengembalikan `NextResponse`
    const response = await middleware(req, event);

    // Mengembalikan response yang valid (NextResponse)
    if (!(response instanceof NextResponse)) {
      throw new Error("Expected an instance of NextResponse to be returned");
    }
    return response;
  };
}
