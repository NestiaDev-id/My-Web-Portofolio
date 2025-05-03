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
  try {
    const publicKey = loadPublicKey();

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("[verifyJWT] Token format tidak valid. Expected 3 parts.");
      return false;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

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

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString()
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    // Optional: verifikasi blacklist token berdasarkan jti
    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { jti: payload.jti },
    });

    if (blacklisted) {
      return false;
    }

    return payload;
  } catch (err) {
    console.error("[verifyJWT] Error saat verifikasi:", err);
    return false;
  }
}

export function getJTIFromToken(
  token: string
): { jti: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null; // Token seharusnya hanya memiliki 3 bagian (header, payload, signature)

  const [, encodedPayload] = parts;

  try {
    const payloadJson = Buffer.from(encodedPayload, "base64url").toString(
      "utf-8"
    );
    const payload = JSON.parse(payloadJson);

    // console.log("[getJTIFromToken] Payload:", payload); // Log payload untuk melihat apakah jti dan exp ada di dalamnya

    if (!payload.jti || !payload.exp) return null;

    return {
      jti: payload.jti,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("[getJTIFromToken] Parsing error:", error);
    return null;
  }
}
