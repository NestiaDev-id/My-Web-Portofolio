import fs from "fs";
import path from "path";

export const loadPrivateKey = () => {
  const privateKeyPath = path.resolve(process.cwd(), "keys/private.key");

  return {
    key: fs.readFileSync(privateKeyPath, "utf8"),
    passphrase: process.env.JWT_PASSPHRASE!,
  };
};

export const loadPublicKey = () => {
  const publicKeyPath = path.resolve(process.cwd(), "keys/public.key");
  return fs.readFileSync(publicKeyPath, "utf8");
};
