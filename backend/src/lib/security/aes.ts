import crypto from "crypto";

// Fungsi untuk enkripsi menggunakan AES-256-CBC
export function encryptAES(plaintext: string, key: Buffer) {
  const iv = crypto.randomBytes(16); // Generate IV secara acak
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv); // Membuat cipher AES-256-CBC
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex"); // Menyelesaikan proses enkripsi
  return { ciphertext: encrypted, iv: iv.toString("hex") }; // Mengembalikan hasil enkripsi dan IV
}

// Fungsi untuk dekripsi menggunakan AES-256-CBC
export function decryptAES(ciphertext: string, key: Buffer, ivHex: string) {
  const iv = Buffer.from(ivHex, "hex"); // Mengubah IV dari hex menjadi buffer
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv); // Membuat decipher untuk AES-256-CBC
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8"); // Menyelesaikan proses dekripsi
  return decrypted; // Mengembalikan hasil dekripsi
}
