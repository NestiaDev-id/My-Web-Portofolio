import { NextApiRequest, NextApiResponse } from "next";
import { verifyJWT, createJWT } from "@/lib/security/jwt";
import * as cookie from "cookie";
import { createCSRFToken } from "@/lib/security/csrf";

const isProd = process.env.NODE_ENV === "production";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Pastikan header cookie ada
    if (!req.headers.cookie) {
      return res.status(400).json({ message: "No cookies found in request" });
    }

    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie);
    const refreshToken = cookies["token2"];

    // Pastikan refresh token ada
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verifikasi refresh token
    const payload = await verifyJWT(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Buat token baru
    const now = Math.floor(Date.now() / 1000);
    const newAccessToken = await createJWT({
      userId: payload.userId,
      email: payload.email,
      iat: now,
      iss: "localhost",
      aud: "localhost",
      sub: "localhost",
      jti: payload.jti,
      exp: now + 30 * 60, // Berlaku selama 30 menit
    });

    console.log("[REFRESH] New access token:", newAccessToken);

    const newCsrfToken = await createCSRFToken({
      userId: payload.userId,
      jwtId: payload.jti,
      iat: now,
      exp: now + 30 * 60, // Berlaku selama 30 menit
    });

    // Set token baru di cookie
    res.setHeader("Set-Cookie", [
      cookie.serialize("token", newAccessToken, {
        httpOnly: true,
        secure: isProd, // true hanya di production
        sameSite: isProd ? "none" : "lax", // pakai "lax" di localhost
        maxAge: 30 * 60, // 30 menit
        path: "/",
      }),
      cookie.serialize("csrfToken", newCsrfToken, {
        httpOnly: false, // CSRF token dapat diakses oleh JavaScript
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 30 * 60, // 30 menit
        path: "/",
      }),
    ]);

    // Jika ada callback URL, redirect ke sana
    const callbackUrl = req.query.callbackUrl as string;
    if (callbackUrl) {
      return res.redirect(302, callbackUrl);
    }

    // Kirim respons sukses
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
