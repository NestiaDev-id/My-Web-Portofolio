import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Helper untuk menjalankan middleware biasa di Next.js
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    callback: (result: any) => void
  ) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Konfigurasi CORS — sesuaikan dengan kebutuhan
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: ["http://localhost:5173", "https://nestiadev.vercel.app"],
  credentials: true, // agar cookie/token bisa dikirim
});

/**
 * Middleware untuk menjalankan CORS
 * @param req Next.js API Request
 * @param res Next.js API Response
 */
export async function runCorsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await runMiddleware(req, res, cors);
}
