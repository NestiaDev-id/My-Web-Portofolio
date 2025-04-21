import crypto from "crypto";
import { generateKeyPair, encrypt, decrypt } from "./kem"; // Misalkan ini adalah pustaka untuk ML-KEM (kunci publik tahan kuantum)

// Fungsi untuk melakukan pertukaran kunci dan enkripsi menggunakan AES-256-CBC
export async function encryptDataWithMLKEM(data: string) {
  // Generasi pasangan kunci untuk ML-KEM (public dan private key)
  const { publicKey, privateKey } = generateKeyPair();

  // Enkripsi menggunakan ML-KEM untuk menghasilkan shared secret
  const sharedSecret = encrypt(publicKey, privateKey);

  // Gunakan shared secret untuk menghasilkan kunci simetris AES
  const aesKey = crypto.createHash("sha256").update(sharedSecret).digest(); // AES Key 256-bit dari shared secret

  // Enkripsi data dengan AES-256-CBC
  const iv = crypto.randomBytes(16); // Generate IV secara acak
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Kembalikan data terenkripsi dan IV untuk digunakan dalam dekripsi nanti
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    publicKey, // Public Key digunakan untuk penerima untuk dekripsi kunci simetris
  };
}

// Fungsi untuk mendekripsi data dengan kunci privat menggunakan ML-KEM
export function decryptDataWithMLKEM(
  encryptedData: string,
  ivHex: string,
  privateKey: Buffer,
  publicKey: Buffer
) {
  // Dapatkan shared secret menggunakan private key dan public key (ML-KEM)
  const sharedSecret = decrypt(privateKey, publicKey);

  // Generate AES Key dari shared secret
  const aesKey = crypto.createHash("sha256").update(sharedSecret).digest();

  // Dekripsi data dengan AES-256-CBC
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
