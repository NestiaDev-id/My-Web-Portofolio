import type { NextApiRequest, NextApiResponse } from "next";

import { verifyJWT } from "@/lib/security/jwt";
import { verifyCSRFToken } from "@/lib/security/csrf";
import { runCorsMiddleware } from "@/lib/middlewares/cors";

// Endpoint untuk akses data yang dilindungi
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Menjalankan middleware CORS
    await runCorsMiddleware(req, res);

    // Verifikasi JWT dan CSRF Token
    const authHeader = req.headers.authorization || "";
    const csrfToken = req.headers["x-csrf-token"] as string;

    console.log("[Protected JWT] Token:", authHeader);
    console.log("[Protected CSRF] Token:", csrfToken);

    let token: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const tokenParts = authHeader.split(" ");

      // Cek apakah hanya terdiri dari 2 bagian: "Bearer <token>"
      if (tokenParts.length === 2) {
        token = tokenParts[1];

        // Validasi tambahan: tidak mengandung koma atau spasi ekstra
        if (token.includes(",") || token.includes(" ")) {
          return res.status(400).json({ message: "Format token tidak valid" });
        }
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    } else {
      console.log("[Successful Token Splitting] Token:", token);
    }

    // Verifikasi JWT
    const payload = await verifyJWT(token);

    if (!payload) {
      return res.status(401).json({ message: "Token JWT tidak valid" });
    } else {
      console.log("[Successful JWT Verification JWT] Payload:", payload);
    }

    // Verifikasi nonce
    const usedNonces = new Set<string>();

    // Verifikasi CSRF token jika ada
    const isCSRFValid = verifyCSRFToken(csrfToken, {
      expectedUserId: payload.userId,
      expectedSessionId: payload.jti, // gunakan jti sebagai sessionId
      nonce: payload.nonce || "",
      usedNonces,
    });

    if (!isCSRFValid) {
      return res.status(403).json({ message: "CSRF token tidak valid" });
    } else {
      console.log("[Successful CSRF Verification] CSRF Token:", csrfToken);
    }

    // Berikan akses ke data yang dilindungi
    res.status(200).json({ message: "Akses berhasil", user: payload });
  } catch (error) {
    console.error("[Protected Endpoint Error]", error);
    res.status(500).json({
      message: "Gagal mengakses data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
