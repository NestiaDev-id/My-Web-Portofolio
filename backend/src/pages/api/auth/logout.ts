import { prisma } from "@/lib/prisma/prisma";
import { getJTIFromToken, verifyJWT } from "@/lib/security/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // (Opsional) Tambahkan logika blacklist token di sini jika perlu
  const token = req.cookies.token;
  if (token) {
    const result = getJTIFromToken(token);

    if (!result) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const { jti, exp } = result;
    const expiresAt = new Date(exp * 1000);

    const expiresIn = exp - Math.floor(Date.now() / 1000);
    if (jti && expiresIn > 0) {
      await prisma.tokenBlacklist.create({
        data: {
          jti,
          expiresAt,
        },
      });
    }
    // Hapus cookie token dan csrf
    res.setHeader("Set-Cookie", [
      "token=; Max-Age=0; Path=/",
      "csrf=; Max-Age=0; Path=/",
    ]);
  }

  return res.status(200).json({ message: "Logged out" });
}
