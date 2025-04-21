import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import crypto from "crypto";
import path from "path";

// Path untuk public key
const publicKeyPath = path.resolve(process.cwd(), "keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

export function verifyToken(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Mengecek token dari header Authorization
      const authorizationHeader = req.headers.authorization || "";
      let token = null;

      // Cek token di Authorization header terlebih dahulu
      if (authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.split(" ")[1];
      }

      // Jika tidak ada di Authorization, cek token di cookie
      if (!token) {
        const cookie = req.headers.cookie || "";
        token = cookie
          .split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];
      }

      // Jika tidak ada token, kembalikan error
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      }

      // Memisahkan token menjadi bagian header, payload, dan signature
      const [headerB64, payloadB64, signatureB64] = token.split(".");
      if (!headerB64 || !payloadB64 || !signatureB64) {
        return res.status(401).json({ message: "Format token salah" });
      }

      const signedData = `${headerB64}.${payloadB64}`;
      const signature = Buffer.from(signatureB64, "base64url");

      // Verifikasi signature menggunakan public key
      const isValid = crypto.verify(
        "RSA-SHA512",
        Buffer.from(signedData),
        publicKey,
        signature
      );

      if (!isValid) {
        return res.status(401).json({ message: "Signature tidak valid" });
      }

      // Decode payload dan lakukan validasi lebih lanjut
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64").toString("utf8")
      );

      // Validasi claim tambahan
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now)
        return res.status(401).json({ message: "Token expired" });
      if (payload.iss !== "SecureApp" || payload.aud !== "SecureClient") {
        return res
          .status(401)
          .json({ message: "Token tidak valid (claim mismatch)" });
      }

      // Tambahkan user info ke request
      (req as any).user = payload;

      return handler(req, res);
    } catch (err) {
      console.error("[VerifyToken]", err);
      return res.status(401).json({ message: "Gagal memverifikasi token" });
    }
  };
}
