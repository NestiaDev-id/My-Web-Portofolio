import { jwtVerify } from "jose";
import { loadPublicKey } from "../security/keyLoader";
type JwtPayload = {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown; // jika ada properti lain yang mungkin ikut
};

export async function verifyJWT_baru(
  token: string
): Promise<JwtPayload | null> {
  try {
    const publickey = loadPublicKey();
    // Konversi PEM ke format yang didukung oleh jose
    const publicKey = await importPublicKey(publickey);

    // Memverifikasi JWT menggunakan public key
    const { payload } = await jwtVerify(token, publicKey);
    console.log("[verifyJWT] Payload:", payload);
    // Ensure the payload matches the JwtPayload structure
    const customPayload: JwtPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      iat: payload.iat,
      exp: payload.exp,
      ...payload, // Include any additional properties
    };
    return customPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Fungsi untuk mengimpor kunci publik dari format PEM ke format yang didukung oleh jose.
 * @param pem Kunci publik dalam format PEM.
 * @returns Kunci publik dalam format yang didukung oleh jose.
 */
async function importPublicKey(pem: string) {
  const pemContents = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  const binaryDer = Buffer.from(pemContents, "base64");
  return crypto.subtle.importKey(
    "spki", // Format kunci publik
    binaryDer, // Data kunci publik dalam ArrayBuffer
    {
      name: "RSASSA-PKCS1-v1_5", // Algoritma yang digunakan
      hash: { name: "SHA-512" }, // Algoritma hash yang digunakan
    },
    false, // Tidak dapat diekspor
    ["verify"] // Hanya untuk operasi verifikasi
  );
}
