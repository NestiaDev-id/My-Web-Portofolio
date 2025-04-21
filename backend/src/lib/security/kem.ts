import crypto from "crypto";

// Fungsi untuk menghasilkan pasangan kunci (public dan private key)
export function generateKeyPair() {
  const privateKey = crypto.randomBytes(32); // Private key 256-bit
  const publicKey = crypto.createHash("sha256").update(privateKey).digest(); // Public key dihasilkan dari hash private key
  return { publicKey, privateKey };
}

// Fungsi untuk mengenkripsi (encapsulation) menggunakan public key
export function encrypt(publicKey: Buffer, privateKey: Buffer) {
  // Gunakan kombinasi publicKey dan privateKey untuk menghasilkan shared secret
  const sharedSecret = crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKey, privateKey]))
    .digest();

  // Salt untuk meningkatkan keamanan
  const salt = crypto.randomBytes(32);
  const ciphertext = Buffer.concat([sharedSecret, salt]).toString("hex");

  return ciphertext;
}

// Fungsi untuk mendekripsi (decapsulation) menggunakan private key dan public key
export function decrypt(privateKey: Buffer, publicKey: Buffer) {
  // Gunakan kombinasi privateKey dan publicKey untuk menghasilkan shared secret
  const sharedSecret = crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKey, privateKey]))
    .digest();

  return sharedSecret;
}
