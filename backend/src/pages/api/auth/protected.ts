import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/middleware/verifyToken";

export default verifyToken(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = (req as any).user;
  res.status(200).json({ message: "Berhasil akses endpoint aman!", user });
});
