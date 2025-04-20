import jwt from "jsonwebtoken";
import type { NextApiRequest, NextApiResponse } from "next";

export function verifyToken(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
      algorithms: ["RS256"],
      issuer: "MyApp",
      audience: "MyAppClient",
      subject: "user-authentication",
      jwtid: "unique-token-id-12345",
    });

    // Jika berhasil diverifikasi, bisa dilanjutkan
    return payload; // Payload bisa digunakan untuk proses selanjutnya
  } catch (err) {
    console.error("[VERIFY TOKEN]", err);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
}
