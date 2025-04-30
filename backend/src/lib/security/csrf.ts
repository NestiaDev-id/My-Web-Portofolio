import { loadPrivateKey, loadPublicKey } from "./keyLoader"; // Fungsi untuk memuat private/public key
import crypto from "crypto"; // Modul untuk operasi kriptografi

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

  // Payload JWT (data yang ingin disimpan dalam token)
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
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

  // Gabungkan header, payload, salt, dan signature untuk membentuk CSRF token
  const csrfToken = `${base64Header}.${base64Payload}.${csrfSalt}.${signature.toString(
    "base64url"
  )}`;

  // Kembalikan CSRF token yang sudah dibuat
  return csrfToken;
}

// Fungsi untuk memverifikasi CSRF Token
export function verifyCSRFToken(csrfToken: string): boolean {
  // Memuat public key yang digunakan untuk memverifikasi tanda tangan
  const publicKey = loadPublicKey();

  // Pisahkan csrfToken menjadi bagian header, payload, salt, dan signature
  const [base64Header, base64Payload, csrfSalt, signature] =
    csrfToken.split(".");

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

  return isVerified; // Kembalikan hasil verifikasi (true jika valid, false jika tidak)
}
