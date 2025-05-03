import { NextApiRequest, NextApiResponse } from "next";
import { verifyJWT, createJWT } from "@/lib/security/jwt";
import * as cookie from "cookie"; // ✅ Perbaiki di sini
import { createCSRFToken } from "@/lib/security/csrf";

const isProd = process.env.NODE_ENV === "production";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req.headers.cookie) {
      return res.status(400).json({ message: "No cookies found in request" });
    }

    const cookies = cookie.parse(req.headers.cookie); // ✅ aman
    const token = cookies["token"];
    const refreshToken = cookies["token2"];

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const payload = await verifyJWT(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const now = Math.floor(Date.now() / 1000);
    const newAccessToken = await createJWT({
      userId: payload.userId,
      email: payload.email,
      iat: now,
      jti: payload.jti,
      exp: now + 30 * 60,
    });

    const newCsrfToken = await createCSRFToken({
      userId: payload.userId,
      jwtId: payload.jti,
      iat: now,
      exp: now + 30 * 60,
    });

    res.setHeader("Set-Cookie", [
      cookie.serialize("token", newAccessToken, {
        httpOnly: true,
        secure: isProd, // true hanya di production
        sameSite: isProd ? "none" : "lax", // pakai "lax" di localhost
        maxAge: 1800,
        path: "/",
      }),
      cookie.serialize("csrfToken", newCsrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 1800,
        path: "/",
      }),
    ]);

    const callbackUrl = req.query.callbackUrl as string;
    if (callbackUrl) {
      res.redirect(callbackUrl);
      return;
    }

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
