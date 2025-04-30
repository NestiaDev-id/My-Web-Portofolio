import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { verifyJWT } from "@/lib/security/jwt";
import { verifyCSRFToken } from "@/lib/security/csrf";

// 🛡️ Middleware wrapper untuk auth + CSRF
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
      const csrf = req.cookies.get("csrf")?.value;
      const csrfHeader = req.headers.get("x-csrf-token");

      // ⛔ Jika tidak ada token → redirect
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(loginUrl);
      }

      const jwtPayload = verifyJWT(token);
      if (typeof jwtPayload !== "object" || !jwtPayload) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const { userId, jti: sessionId } = jwtPayload as unknown as {
        userId: string;
        jti: string;
      };

      const usedNonces: Set<string> = new Set(); // ⛔ Replace this with persistent store if needed

      const isValidJWT = verifyJWT(token);
      const isValidCSRF =
        req.method === "GET" || // Skip CSRF check for safe methods
        (csrf &&
          csrfHeader &&
          verifyCSRFToken(csrf, {
            expectedUserId: userId,
            expectedSessionId: sessionId,
            usedNonces,
          }));

      if (!isValidJWT || !isValidCSRF) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // ✅ Token valid, lanjut ke middleware berikutnya
      (req as any).user = { userId, sessionId };
      (req as any).usedNonces = usedNonces; // Simpan nonce untuk digunakan di middleware berikutnya
      (req as any).csrf = csrf; // Simpan CSRF token untuk digunakan di middleware berikutnya
    }

    return middleware(req, event);
  };
}
