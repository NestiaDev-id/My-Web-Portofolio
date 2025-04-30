"use client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import crypto from "crypto";
import argon2 from "argon2";
import { emailLimiter, getIP, globalLimiter } from "@/lib/security/limiter";
import { loginSchema } from "@/lib/validation/login.schema";
import { createJWT } from "@/lib/security/jwt";
import { createCSRFToken } from "@/lib/security/csrf";
import useragent from "useragent";

const isProd = process.env.NODE_ENV === "production";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Cek apakah pengguna sudah login
    if (req.cookies.token) {
      return res.status(200).json({ message: "User already logged in" });
    }

    // Rate limiter untuk mencegah penyalahgunaan API
    await globalLimiter.check(req, res);
    await emailLimiter.check(req, res);

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Cek apakah akun terkunci karena terlalu banyak percobaan login gagal
    if (user.failedAttempts >= 3 && user.lockedAt) {
      return res.status(403).json({ message: "Account is locked" });
    }

    // Validasi input menggunakan schema
    const { email, password } = loginSchema.parse(req.body);
    if (email !== process.env.ALLOWED_USER_EMAIL) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verifikasi password menggunakan Argon2
    const stripped = user.password.replace("$argon2id$", "");
    const original = `$argon2id$${stripped}`;
    const valid = await argon2.verify(original, password);
    if (!valid) {
      // Tambahkan percobaan login gagal jika password salah
      await prisma.user.update({
        where: { email },
        data: {
          failedAttempts: { increment: 1 },
          lockedAt: user.failedAttempts + 1 >= 3 ? new Date() : null,
        },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset percobaan login gagal setelah login berhasil
    await prisma.user.update({
      where: { email },
      data: {
        failedAttempts: 0,
        lockedAt: null,
      },
    });

    // Ambil metadata login
    const ip = getIP(req); // IP pengguna
    const userAgent = req.headers["user-agent"] || ""; // User-Agent pengguna
    const userAgentInfo = useragent.parse(userAgent); // Parse User-Agent

    // Simpan metadata login ke database
    await prisma.sessionLog.create({
      data: {
        userId: user.id,
        ip,
        userAgent: userAgentInfo.toString(),
        location: "Unknown", // Bisa menggunakan geolocation API jika diperlukan
        action: "LOGIN",
      },
    });

    // 🔐 Buat payload JWT untuk otorisasi
    const payload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token berlaku selama 1 jam
      iss: "SecureApp",
      aud: "SecureClient",
      sub: "user-authentication",
      jti: crypto.randomUUID(), // Unique ID untuk token
    };

    // Generate JWT token
    const jwt = createJWT(payload);

    // 🔐 Buat CSRF token untuk validasi anti-CSRF
    const csrfPayload = {
      userId: user.id,
      sessionId: payload.jti, // Gunakan JTI (JWT ID) sebagai session ID
    };
    const csrfToken = createCSRFToken(csrfPayload);

    // Set cookie untuk token dan CSRF token
    res.setHeader("Set-Cookie", [
      `token=${jwt}; Path=/; Max-Age=3600; SameSite=Strict; Secure${
        isProd ? "; HttpOnly" : ""
      }`,
      `csrfToken=${csrfToken}; Path=/; Max-Age=1800; SameSite=Strict; Secure`,
    ]);

    // Kirim respons sukses
    return res
      .status(200)
      .json({ message: "Login berhasil", token: jwt, csrf: csrfToken });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return res.status(400).json({ message: "Bad Request" });
  }
}
