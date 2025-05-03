// import fs from "fs";
// import path from "path";

export const loadPrivateKey = () => {
  const privateKey = process.env.PRIVATE_KEY;
  const passphrase = process.env.JWT_PASSPHRASE;

  if (!privateKey) {
    throw new Error("Private key is not set in environment variables");
  }

  if (!passphrase) {
    throw new Error("JWT passphrase is not set in environment variables");
  }

  return {
    key: privateKey,
    passphrase,
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
