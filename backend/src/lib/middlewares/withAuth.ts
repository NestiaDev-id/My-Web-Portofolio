import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { verifyJWT } from "@/lib/security/jwt"; // Pastikan ini menggunakan Web Crypto API
import { verifyCSRFToken } from "@/lib/security/csrf";
import { verifyJWT2 } from "./verifyJWT2";

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

      // Cross check token menggunakan verifyJWT
      try {
        const jwtPayload = await verifyJWT(token);
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
              usedNonces: new Set(), // Use a shared store in production like Redis
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
        // Jika ada error saat verifikasi JWT
        console.error("Token verification failed", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return middleware(req, event);
  };
}
