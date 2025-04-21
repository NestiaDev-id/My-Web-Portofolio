import crypto from "crypto";

// Buat pseudo "keypair"
export function generateKeyPair() {
  const privateKey = crypto.randomBytes(32);
  const publicKey = crypto.createHash("sha256").update(privateKey).digest(); // Simulasi publicKey
  return { publicKey, privateKey };
}

// Encapsulation: Kirim "ciphertext" (misalnya publicKey + salt)
export function encapsulate(publicKey: Buffer) {
  const salt = crypto.randomBytes(32);
  const sharedSecret = crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKey, salt]))
    .digest();
  const ciphertext = salt.toString("hex");
  return { sharedSecret, ciphertext };
}

// Decapsulation: Terima ciphertext dan derive sharedSecret
export function decapsulate(privateKey: Buffer, ciphertext: string) {
  const salt = Buffer.from(ciphertext, "hex");
  const publicKey = crypto.createHash("sha256").update(privateKey).digest();
  const sharedSecret = crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKey, salt]))
    .digest();
  return sharedSecret;
}
