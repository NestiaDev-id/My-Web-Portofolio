import crypto from "crypto";
import { loadPrivateKey, loadPublicKey } from "./keyLoader";
import { prisma } from "../prisma/prisma";

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
  jti: string; // JWT ID
  nonce?: string; // Nonce untuk CSRF
}

/**
 * Membuat JWT menggunakan RSA-SHA512
 * @param payload Data yang akan dimasukkan ke dalam payload JWT
 * @returns JWT dalam format string
 */
export function createJWT(payload: JwtPayload): string {
  const privateKey = loadPrivateKey();

  const header = {
    alg: "RS512",
    typ: "JWT",
    kid: "auth-key-001",
  };

  const encode = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const tokenPart = `${encode(header)}.${encode(payload)}`;

  const signer = crypto.createSign("RSA-SHA512");
  signer.update(tokenPart);
  signer.end();

  const signature = signer
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${tokenPart}.${signature}`;
}

/**
 * Memverifikasi JWT menggunakan RSA-SHA512
 * @param token JWT yang akan diverifikasi
 * @returns Payload JWT jika valid, atau `null` jika tidak valid
 */
export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  try {
    const publicKey = loadPublicKey();

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("[verifyJWT] Token format tidak valid. Expected 3 parts.");
      return null;
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
      console.warn("[verifyJWT] Signature tidak valid.");
      return null;
    }

    const payload: JwtPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString()
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn("[verifyJWT] Token sudah kedaluwarsa.");
      return null;
    }

    // Verifikasi blacklist token berdasarkan jti
    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { jti: payload.jti },
    });

    if (blacklisted) {
      console.warn("[verifyJWT] Token masuk dalam blacklist.");
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[verifyJWT] Error saat verifikasi:", err);
    return null;
  }
}

/**
 * Mendapatkan JTI dan exp dari token
 * @param token JWT yang akan diproses
 * @returns Objek berisi `jti` dan `exp`, atau `null` jika token tidak valid
 */
export function getJTIFromToken(
  token: string
): { jti: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.warn("[getJTIFromToken] Token format tidak valid.");
    return null;
  }

  const [, encodedPayload] = parts;

  try {
    const payloadJson = Buffer.from(encodedPayload, "base64url").toString(
      "utf-8"
    );
    const payload = JSON.parse(payloadJson);

    if (!payload.jti || !payload.exp) {
      console.warn(
        "[getJTIFromToken] jti atau exp tidak ditemukan di payload."
      );
      return null;
    }

    return {
      jti: payload.jti,
      exp: payload.exp,
    };
  } catch (error) {
    console.error("[getJTIFromToken] Parsing error:", error);
    return null;
  }
}
