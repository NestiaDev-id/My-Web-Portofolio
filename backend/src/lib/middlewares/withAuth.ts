import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";
import { verifyJWT } from "@/lib/security/jwt"; // Pastikan ini menggunakan Web Crypto API
import { verifyCSRFToken } from "@/lib/security/csrf";
import { verifyJWT2, verifyJWT_baru } from "./verifyJWT2";

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
        const jwtPayload = await verifyJWT_baru(token);
        if (!jwtPayload || typeof jwtPayload !== "object") {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
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

// import {
//   NextFetchEvent,
//   NextMiddleware,
//   NextRequest,
//   NextResponse,
// } from "next/server";
// import { verifyJWT_baru } from "@/lib/middlewares/verifyJWT2"; // Pastikan createJWT di-export
// import { createJWT } from "@/lib/security/jwt";
// export default function withAuth(
//   middleware: NextMiddleware,
//   requireAuthPaths: string[] = []
// ) {
//   return async (req: NextRequest, event: NextFetchEvent) => {
//     const pathname = req.nextUrl.pathname;
//     const needsAuth = requireAuthPaths.some((path) =>
//       pathname.startsWith(path)
//     );

//     if (!needsAuth) return middleware(req, event);

//     const token = req.cookies.get("token")?.value;
//     const refreshToken = req.cookies.get("token2")?.value;

//     let jwtPayload = null;

//     // 🔐 Coba verifikasi access token dulu
//     if (token) {
//       jwtPayload = await verifyJWT_baru(token).catch(() => null);
//     }

//     // // 🔁 Jika access token gagal diverifikasi → coba refresh
//     // if (!jwtPayload && refreshToken) {
//     //   const refreshPayload = await verifyJWT_baru(refreshToken).catch(
//     //     () => null
//     //   );

//     //   if (refreshPayload && refreshPayload.userId) {
//     //     // ✅ Buat access token baru
//     //     const newAccessToken = createJWT({
//     //       userId: refreshPayload.userId,
//     //       email: refreshPayload.email,
//     //       iat: Math.floor(Date.now() / 1000),
//     //       exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 menit
//     //     });

//     //     // 📦 Set cookie access token baru
//     //     const res = NextResponse.next();
//     //     res.cookies.set("token", newAccessToken, {
//     //       httpOnly: true,
//     //       sameSite: "strict",
//     //       secure: true,
//     //       maxAge: 60 * 30,
//     //       path: "/",
//     //     });

//     //     return middleware(req, event);
//     //   }

//     //   // ❌ Refresh token juga gagal → redirect login
//     //   const loginUrl = new URL("/auth/login", req.url);
//     //   loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
//     //   return NextResponse.redirect(loginUrl);
//     // }

//     // // ❌ Tidak ada token sama sekali
//     // if (!jwtPayload) {
//     //   const loginUrl = new URL("/auth/login", req.url);
//     //   loginUrl.searchParams.set("callbackUrl", encodeURIComponent(req.url));
//     //   return NextResponse.redirect(loginUrl);
//     // }

//     return middleware(req, event);
//   };
// }
