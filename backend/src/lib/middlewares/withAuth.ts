import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { verifyJWT } from "@/lib/security/jwt";
import { verifyCSRFToken } from "@/lib/security/csrf";

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
      const csrfHeader = req.headers.get("x-csrf-token") ?? "";

      // ⛔ Token tidak ada → redirect ke login
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(loginUrl);
      }

      const jwtPayload = await verifyJWT(token);
      if (!jwtPayload || typeof jwtPayload !== "object") {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { userId, jti: sessionId } = jwtPayload as {
        userId: string;
        jti: string;
      };

      // Skip CSRF check for safe methods
      const method = req.method.toUpperCase();
      const safeMethod =
        method === "GET" || method === "HEAD" || method === "OPTIONS";

      let csrfValid = true;
      if (!safeMethod) {
        csrfValid = !!(
          csrfToken &&
          csrfHeader &&
          verifyCSRFToken(csrfToken, {
            expectedUserId: userId,
            expectedSessionId: sessionId,
            usedNonces: new Set(), // ❗ NOTE: In production, use a shared store like Redis
            nonce: csrfHeader,
          })
        );
      }

      if (!csrfValid) {
        return NextResponse.json(
          { error: "Invalid CSRF token" },
          { status: 403 }
        );
      }

      // ✅ Token valid → inject info ke request dan lanjut
      (req as any).user = { userId, sessionId };
    }

    return middleware(req, event);
  };
}
