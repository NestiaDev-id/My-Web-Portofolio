import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
// import { createJWT, verifyJWT } from "@/lib/security/jwt"; // Pastikan ini menggunakan Web Crypto API
import { decodeJwt } from "jose";

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
      // Ambil token dari cookie
      const token = req.cookies.get("token")?.value;
      const refreshToken = req.cookies.get("token2")?.value;
      const csrfToken = req.cookies.get("csrfToken")?.value;

      if (!token || !csrfToken) {
        // ⛔ Token hilang → redirect ke halaman login
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname); // cukup encode otomatis oleh URL
        return NextResponse.redirect(loginUrl);
      }

      try {
        // ⏱ Decode token terlebih dahulu tanpa verifikasi
        const decodedAccessToken = decodeJwt(token);
        const decodedRefreshToken = refreshToken
          ? decodeJwt(refreshToken)
          : null;
        console.log("decodedAccessToken", decodedAccessToken);
        console.log("decodedRefreshToken", decodedRefreshToken);

        // Jika accesstoken lebih kecil dari refreshtoken
        if (
          decodedAccessToken.exp &&
          decodedRefreshToken?.exp &&
          decodedAccessToken.exp < Math.floor(Date.now() / 1000) && // Access token sudah kedaluwarsa
          decodedRefreshToken.exp > Math.floor(Date.now() / 1000) // Refresh token masih valid
        ) {
          console.log("Token expired, refreshing...");

          // // Buat token baru dengan masa berlaku 30 menit
          // const newToken = await createJWT({
          //   userId: decodedAccessToken.userId,
          //   email: decodedAccessToken.email,
          //   iat: Math.floor(Date.now() / 1000),
          //   exp: Math.floor(Date.now() / 1000) + 30 * 60, // Berlaku selama 30 menit
          // });

          // // Set cookie untuk token baru
          // const response = NextResponse.next();
          // response.cookies.set("token", newToken, {
          //   httpOnly: true,
          //   sameSite: "strict",
          //   secure: true,
          //   maxAge: 30 * 60, // 30 menit
          //   path: "/",
          // });

          // return response;

          const refreshUrl = new URL("/api/auth/refresh", req.url);
          refreshUrl.searchParams.set("callbackUrl", req.url); // optional redirect back

          return NextResponse.redirect(refreshUrl);
        }

        // Jika token valid, lanjutkan ke middleware berikutnya
        return middleware(req, event);
      } catch (error) {
        console.error("Token verification failed", error);

        // Jika token tidak valid, redirect ke halaman login
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
        return NextResponse.redirect(loginUrl);
      }
    }

    // Jika path tidak memerlukan autentikasi, lanjutkan ke middleware berikutnya
    return middleware(req, event);
  };
}
