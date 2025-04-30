import crypto from "crypto";
import { loadPrivateKey } from "./keyLoader";

export function createJWT(payload: any): string {
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
