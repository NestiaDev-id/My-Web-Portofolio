import fs from "fs";
import path from "path";

export const loadPrivateKey = () => {
  const privateKeyPath = path.resolve(process.cwd(), "keys/private.key");

  if (!fs.existsSync(privateKeyPath)) {
    console.log("Private key not found");
    throw new Error("Private key not found");
  }
  return {
    key: fs.readFileSync(privateKeyPath, "utf8"),
    passphrase: process.env.JWT_PASSPHRASE!,
  };
};

// export const loadPublicKey = () => {
//   const publicKeyPath = path.resolve(process.cwd(), "keys/public.key");

//   if (!fs.existsSync(publicKeyPath)) {
//     console.log("Public key not found");
//     throw new Error("Public key not found");
//   }
//   return fs.readFileSync(publicKeyPath, "utf8");
// };
export const loadPublicKey = (): string => {
  const publicKey = process.env.PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Public key is not set in environment variables");
  }
  return publicKey;
};
