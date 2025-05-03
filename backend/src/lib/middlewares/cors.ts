import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Inisialisasi CORS
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
  origin: ["http://localhost:5173", "https://nestiadev.vercel.app"], // Atur sesuai client
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  credentials: true,
});

// Utility untuk menjalankan middleware
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}
