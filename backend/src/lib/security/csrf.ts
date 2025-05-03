import { loadPrivateKey, loadPublicKey } from "./keyLoader"; // Fungsi untuk memuat private/public key
import crypto from "crypto"; // Modul untuk operasi kriptografi

type VerifyCSRFOptions = {
  expectedUserId: string;
  expectedSessionId: string;
  usedNonces: Set<string>; // Atau storage lain untuk memantau reuse
  nonce: string;
};

// Default masa berlaku token (dalam detik) — contoh: 30 menit
const CSRF_TOKEN_EXPIRY_SECONDS = 1800;

// Fungsi untuk membuat CSRF Token
export function createCSRFToken(payload: any): string {
  // Memuat private key yang digunakan untuk menandatangani token CSRF (RSA)
  const privateKey = loadPrivateKey();
  const csrfSecretKey = process.env.CSRF_SECRET_KEY;

  if (!csrfSecretKey) {
    throw new Error("Csrf secret key is not defined in environment variables");
  }

  // Header JWT (algoritma dan tipe token)
  const header = { alg: "RS512", typ: "JWT", kid: "auth-key-001" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );

  // Tambahkan expiry timestamp dan nonce ke payload
  const extendedPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + CSRF_TOKEN_EXPIRY_SECONDS,
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  // Payload JWT (data yang ingin disimpan dalam token)
  const base64Payload = Buffer.from(JSON.stringify(extendedPayload)).toString(
    "base64url"
  );

  // Gabungkan kembali header dan payload untuk ditandatangani
  const dataToSign = `${base64Header}.${base64Payload}`;

  // Buat salt menggunakan csrfSecretKey untuk menambah keacakan
  const csrfSalt = crypto
    .createHmac("sha256", csrfSecretKey)
    .update("CSRF_Salt")
    .digest("base64url");

  // Gabungkan data yang akan ditandatangani dengan salt
  const finalDataToSign = `${dataToSign}.${csrfSalt}`;

  // Buat tanda tangan menggunakan private key dengan algoritma RSA-SHA512
  const signature = crypto.sign(
    "RSA-SHA512",
    Buffer.from(finalDataToSign),
    privateKey
  );

  return `${base64Header}.${base64Payload}.${csrfSalt}.${signature.toString(
    "base64url"
  )}`;
}

// Fungsi untuk memverifikasi CSRF Token
export function verifyCSRFToken(
  csrfToken: string,
  options: VerifyCSRFOptions
): boolean {
  try {
    const { expectedUserId, expectedSessionId, usedNonces, nonce } = options;

    const publicKey = loadPublicKey();

    // Pisahkan csrfToken menjadi bagian header, payload, salt, dan signature
    const [base64Header, base64Payload, csrfSalt, signature] =
      csrfToken.split(".");

    console.log("[verifyCSRFToken] csrfToken:", csrfToken);

    // Gabungkan kembali header dan payload untuk divalidasi
    const dataToVerify = `${base64Header}.${base64Payload}`;

    // Gabungkan data yang akan diverifikasi dengan salt
    const finalDataToVerify = `${dataToVerify}.${csrfSalt}`;

    // Verifikasi signature dengan public key menggunakan algoritma RSA-SHA512
    const isVerified = crypto.verify(
      "RSA-SHA512", // Algoritma RSA yang digunakan untuk verifikasi
      Buffer.from(finalDataToVerify), // Data yang akan diverifikasi
      publicKey, // Public key yang digunakan untuk verifikasi
      Buffer.from(signature, "base64url") // Signature yang akan diverifikasi
    );

    if (!isVerified) {
      return false; // Jika signature tidak valid, kembalikan false
    }

    const payload = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf-8")
    );

    // ❗ Verifikasi token tidak kadaluwarsa
    if (typeof payload.exp !== "number" || Date.now() / 1000 > payload.exp) {
      return false;
    }

    // Tambahkan logika validasi userId/sessionId jika diperlukan
    if (
      payload.userId !== expectedUserId ||
      payload.sessionId !== expectedSessionId
    ) {
      return false;
    }

    //  ! TODO: Simpan nonce ke dalam storage (Redis) untuk mencegah reuse
    // Jika menggunakan Redis, Anda bisa menggunakan perintah SETEX untuk menyimpan nonce dengan masa berlaku yang sama dengan token CSRF
    // 🔁 Replay protection menggunakan nonce
    if (typeof payload.nonce !== "string" || usedNonces.has(payload.nonce)) {
      return false; // nonce pernah digunakan → replay attack
    }

    if (usedNonces.has(nonce)) return false;
    usedNonces.add(nonce);

    return true;
  } catch (error) {
    console.error("Error verifying CSRF token:", error);
    return false; // Jika terjadi kesalahan, anggap token tidak valid
  }
}
