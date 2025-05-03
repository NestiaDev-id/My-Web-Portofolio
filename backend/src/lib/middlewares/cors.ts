// import Cors from "cors";
// import { NextApiRequest, NextApiResponse } from "next";

// // Inisialisasi CORS
// const cors = Cors({
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   origin: ["http://localhost:5173", "https://nestiadev.vercel.app"], // Atur sesuai client
//   allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
//   credentials: true,
// });

// // Utility untuk menjalankan middleware
// export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
//   return new Promise((resolve, reject) => {
//     cors(req, res, (result: any) => {
//       if (result instanceof Error) return reject(result);
//       return resolve(result);
//     });
//   });
// }
// src/lib/middlewares/cors.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Helper untuk menjalankan middleware biasa di Next.js
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

import Cors from "cors";

// Konfigurasi CORS — sesuaikan dengan kebutuhan
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: ["http://localhost:5173", "https://nestiadev.vercel.app"],
  credentials: true, // agar cookie/token bisa dikirim
});

export async function runCorsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);
}
