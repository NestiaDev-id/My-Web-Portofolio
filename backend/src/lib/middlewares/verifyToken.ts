import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import csrf from "csrf";
import { runCorsMiddleware } from "./cors";

const publicKeyPath = path.resolve(process.cwd(), "keys/public.key");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

const tokens = new csrf();

export default function verifyToken(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Jalankan middleware CORS dulu
      await runCorsMiddleware(req, res);

      // CSRF Token check untuk metode rawan modifikasi
      if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
        const csrfToken = req.headers["x-csrf-token"];
        const secret = process.env.CSRF_SECRET;
        if (
          !csrfToken ||
          !secret ||
          !tokens.verify(secret, csrfToken as string)
        ) {
          return res.status(403).json({ message: "CSRF token tidak valid" });
        }
      }

      // Ambil JWT dari header Authorization atau cookie
      const authorizationHeader = req.headers.authorization || "";
      let token = null;

      if (authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.split(" ")[1];
      }

      if (!token) {
        const cookie = req.headers.cookie || "";
        token = cookie
          .split(";")
          .find((c) => c.trim().startsWith("token="))
          ?.split("=")[1];
      }

      if (!token)
        return res.status(401).json({ message: "Token tidak ditemukan" });

      const [headerB64, payloadB64, signatureB64] = token.split(".");
      if (!headerB64 || !payloadB64 || !signatureB64)
        return res.status(401).json({ message: "Format token salah" });

      const signedData = `${headerB64}.${payloadB64}`;
      const signature = Buffer.from(signatureB64, "base64url");

      const isValid = crypto.verify(
        "RSA-SHA512",
        Buffer.from(signedData),
        publicKey,
        signature
      );

      if (!isValid)
        return res.status(401).json({ message: "Signature tidak valid" });

      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64").toString("utf8")
      );

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now)
        return res.status(401).json({ message: "Token expired" });

      if (payload.iss !== "SecureApp" || payload.aud !== "SecureClient")
        return res
          .status(401)
          .json({ message: "Token tidak valid (claim mismatch)" });

      (req as any).user = payload;

      return handler(req, res);
    } catch (err) {
      console.error("[VerifyToken]", err);
      return res.status(401).json({ message: "Gagal memverifikasi token" });
    }
  };
}
