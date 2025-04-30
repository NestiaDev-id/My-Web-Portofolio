import argon2 from "argon2";

export async function verifyPassword(
  storedHash: string,
  inputPassword: string
): Promise<boolean> {
  const normalized = storedHash.replace("$argon2id$", "");
  const finalHash = `$argon2id$${normalized}`;
  return await argon2.verify(finalHash, inputPassword);
}
