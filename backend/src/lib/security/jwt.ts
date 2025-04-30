import crypto from "crypto";
import { loadPrivateKey, loadPublicKey } from "./keyLoader";
import { prisma } from "../prisma/prisma";

export function createJWT(payload: any): string {
  // 🔑 Ambil private key dari file atau environment
  const privateKey = loadPrivateKey();

  // 📦 Header JWT: menentukan algoritma dan tipe
  const header = {
    alg: "RS512", // RSA-SHA512 untuk tanda tangan (signature)
    typ: "JWT", // Jenis token
    kid: "auth-key-001", // ID kunci opsional (key ID), digunakan jika ada banyak key
  };

  // 🧩 Fungsi untuk encode ke base64-url (tanpa padding, + dan /)
  const encode = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64") // → ubah ke base64
      .replace(/=/g, "") // → hapus padding "="
      .replace(/\+/g, "-") // → ubah + jadi -
      .replace(/\//g, "_"); // → ubah / jadi _

  // 🧱 Gabungkan header dan payload yang sudah diencode
  const tokenPart = `${encode(header)}.${encode(payload)}`;

  // ✍️ Buat objek untuk menandatangani data menggunakan algoritma RSA-SHA512
  const signer = crypto.createSign("RSA-SHA512");
  signer.update(tokenPart); // Masukkan data (header.payload)
  signer.end();

  // 🖋️ Tanda tangani data dengan privateKey → hasilnya base64 signature
  const signature = signer
    .sign(privateKey, "base64")
    .replace(/=/g, "") // → konversi ke base64-url
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // 🏁 Gabungkan semuanya menjadi JWT akhir: header.payload.signature
  return `${tokenPart}.${signature}`;
}

export async function verifyJWT(token: string): Promise<boolean> {
  const publicKey = loadPublicKey();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const parts = token.split(".");
  if (parts.length !== 4) {
    return false; // Format tidak sesuai
  }

  const [encodedHeader, encodedPayload, salt, signature] = parts;

  // 🔁 Bangun ulang data yang akan diverifikasi
  const dataToVerify = `${encodedHeader}.${encodedPayload}.${salt}`;

  const verifier = crypto.createVerify("RSA-SHA512");
  verifier.update(dataToVerify);
  verifier.end();

  const isValidSignature = verifier.verify(
    publicKey,
    Buffer.from(signature, "base64url")
  );

  if (!isValidSignature) {
    return false;
  }

  // ⏳ Periksa waktu kadaluwarsa
  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString()
  );

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return false;
  }

  // 🔐 Verifikasi salt cocok
  const expectedSalt = crypto
    .createHmac("sha256", jwtSecret)
    .update("jwt_salt")
    .digest("base64url");

  if (salt !== expectedSalt) {
    return false;
  }

  // 🛑 Periksa apakah JWT terdaftar di blacklist
  const blacklisted = await prisma.tokenBlacklist.findUnique({
    where: { jti: payload.jti }, // Menggunakan JTI sebagai ID unik untuk token
  });

  if (blacklisted) {
    return false; // Token ditemukan di blacklist, dianggap tidak valid
  }

  return true; // ✅ Token valid
}

export function getJTIFromToken(
  token: string
): { jti: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [, encodedPayload] = parts;

  try {
    const payloadJson = Buffer.from(encodedPayload, "base64url").toString(
      "utf-8"
    );
    const payload = JSON.parse(payloadJson);

    if (!payload.jti || !payload.exp) return null;

    return {
      jti: payload.jti,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
