import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/middleware/verifyToken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = verifyToken(req, res);
  if (!payload || res.writableEnded) return;

  return res.status(200).json({ message: "Akses berhasil", user: payload });
}
