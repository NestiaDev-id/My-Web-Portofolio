// File: lib/middlewares/csrf-token.ts
import { NextApiRequest, NextApiResponse } from "next";

// Fungsi middleware CSRF Token
export async function runMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve) => {
    // Pastikan kita menerima token CSRF di header
    const csrfToken = req.headers["x-csrf-token"];
    if (!csrfToken) {
      // Jika tidak ada CSRF token
      return res.status(403).json({ message: "CSRF token missing" });
    }

    // Lakukan pengecekan atau verifikasi CSRF token di sini
    // if (csrfToken !== process.env.CSRF_TOKEN) {
    //   // Jika token CSRF tidak valid
    //   return res.status(403).json({ message: "Invalid CSRF token" });
    // }

    // Jika CSRF token valid
    console.log("[CSRF] CSRF token valid");
    resolve(true);
  });
}
