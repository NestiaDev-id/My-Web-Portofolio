import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Menghapus cookie token dengan cara mengatur ulang dan masa hidup negatif
  res.setHeader(
    "Set-Cookie",
    `token=; Path=/; Max-Age=0; SameSite=Strict; Secure${
      process.env.NODE_ENV === "production" ? "; HttpOnly" : ""
    }`
  );

  return res.status(200).json({ message: "Logout berhasil" });
}
