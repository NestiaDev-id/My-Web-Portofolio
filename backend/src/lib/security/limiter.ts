import rateLimit from "@/lib/security/rate-limit";
import { NextApiRequest } from "next";

// Global rate limiter (per IP)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 5, // Maksimum 5 request per menit per IP
  keyGenerator: (req) => {
    // Ambil IP pengguna dari header 'x-forwarded-for' atau 'connection.remoteAddress'
    return getIP(req); // Fungsi getIP yang kita buat sebelumnya
  },
});

// Fungsi untuk mendapatkan IP dari NextApiRequest
export function getIP(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket?.remoteAddress;

  return ip || "global";
}

// Email limiter (misalnya berdasarkan email di headers)
export const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 3, // Maksimum 3 request per menit per email
  keyGenerator: (req: NextApiRequest) => {
    return getEmail(req);
  },
});

function getEmail(req: NextApiRequest): string {
  const email = req.headers["email"];
  return Array.isArray(email) ? email[0] : email || "unknown-email";
}
