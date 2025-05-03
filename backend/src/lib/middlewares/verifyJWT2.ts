import { verifyJWT } from "@/lib/security/jwt"; // Pastikan ini yang pakai Web Crypto

export async function verifyJWT2(token: string) {
  const isValid = await verifyJWT(token);
  if (!isValid) throw new Error("JWT verification failed");

  // Decode payload secara manual (tanpa tanda tangan)
  const payloadB64 = token.split(".")[1];
  const payloadJson = atob(payloadB64);
  return JSON.parse(payloadJson);
}

async function importPublicKey(pem) {
  const binaryDer = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );
}
function pemToArrayBuffer(pem) {
  const b64Lines = pem.replace(/-----.*-----/g, "").replace(/\s+/g, "");
  const b64Decoded = atob(b64Lines);
  const arrayBuffer = new Uint8Array(b64Decoded.length);
  for (let i = 0; i < b64Decoded.length; i++) {
    arrayBuffer[i] = b64Decoded.charCodeAt(i);
  }
  return arrayBuffer.buffer;
}
