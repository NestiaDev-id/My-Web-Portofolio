"use client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma"; // Database client for querying user data
import { z } from "zod"; // Input validation
import rateLimit from "@/lib/middlewares/rate-limit"; // Rate limiting middleware
import fs from "fs";
import crypto from "crypto";
import argon2 from "argon2";

// Load private key dengan passphrase
const privateKey = {
  key: fs.readFileSync("./keys/private.key", "utf8"),
  passphrase: process.env.JWT_PASSPHRASE!, // Disimpan di .env
};

// Configuring global rate limiter (per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) =>
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "global", // Use IP as key for global rate limiting
});

// Configuring user-specific rate limiter (per email)
const userRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 login attempts per email per minute
  keyGenerator: (req) => req.body.email, // Use email as key
});

const isProd = process.env.NODE_ENV === "production";

// Definisi skema validasi email dan password
const loginSchema = z.object({
  email: z
    .string()
    .email()
    .refine((email) => {
      // Validasi email dengan regex untuk memastikan formatnya benar
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email) && email.endsWith("@gmail.com"); // Validasi domain @gmail.com
    }),
  password: z.string().min(6), // Password minimal 6 karakter
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end(); // Early check for method

  try {
    // Mengecek token JWT yang sudah ada di cookie, jika sudah ada maka tidak perlu login kembali
    if (req.cookies.token) {
      return res.status(200).json({ message: "User already logged in" });
    }

    // Memeriksa apakah alamat IP melampaui batas permintaan
    // ✅ Rate limit per IP
    const ip =
      (Array.isArray(req.headers["x-forwarded-for"])
        ? req.headers["x-forwarded-for"][0]
        : req.headers["x-forwarded-for"]) ||
      req.socket.remoteAddress ||
      "global";
    // console.log("🧠 IP address:", ip);
    await limiter.check(res, 5, ip);

    // Check user-specific rate limit based on email
    const { email, password } = loginSchema.parse(req.body); // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Login gagal",
        error: "Email atau password tidak sesuai format yang diizinkan.",
      });
    }
    // console.log("✅ Validated input:", { email });
    await userRateLimiter.check(res, 3, email); // Max 3 login attempts per email per minute

    // Cek apakah email sesuai dengan yang diperbolehkan (email tunggal untuk aplikasi)
    if (email !== process.env.ALLOWED_USER_EMAIL) {
      return res
        .status(401)
        .json({ message: "Login gagal", error: "Unauthorized" }); // Unauthorized jika email tidak cocok
    }

    // Mencari user di database berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({
        message: "Login gagal",
        error: "User atau akun tidak ditemukan.",
      }); // Unauthorized jika user tidak ditemukan

    // Membandingkan password yang diberikan dengan password yang di-hash di database
    // const valid = await bcrypt.compare(password, user.password);
    const stripped = user.password.replace("$argon2id$", ""); // Remove "$argon2id$" if it's there

    const original = `$argon2id$${stripped}`; // Add it back
    const valid = await argon2.verify(original, password);

    if (!valid)
      return res.status(401).json({
        message: "Login gagal",
        error: "Email atau password yang anda masukan salah.",
      }); // Unauthorized jika password salah

    // Update lastLogin pada user
    await prisma.user.update({
      where: { email },
      data: {
        lastLogin: new Date(), // Update lastLogin dengan waktu saat ini
      },
    });

    const header = {
      alg: "RS512",
      typ: "JWT",
      kid: "auth-key-001",
    };

    const payload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 jam
      iss: "SecureApp",
      aud: "SecureClient",
      sub: "user-authentication",
      jti: crypto.randomUUID(),
    };
    const encode = (obj: any) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const tokenPart = `${encode(header)}.${encode(payload)}`;

    const signer = crypto.createSign("RSA-SHA512");
    signer.update(tokenPart);
    signer.end();

    const signature = signer
      .sign(privateKey, "base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwtToken = `${tokenPart}.${signature}`;
    // console.log("🔐 JWT Token created");

    // Mengirim token dalam cookie HTTP-Only yang aman
    res.setHeader(
      "Set-Cookie",
      `token=${jwtToken}; Path=/; Max-Age=3600; SameSite=Strict; Secure${
        isProd ? "; HttpOnly" : ""
      }`
    );

    // Mengirimkan respons berhasil
    return res.status(200).json({ message: "Login berhasil", token: jwtToken });
  } catch (err) {
    // Menangani error dan mengirimkan pesan kesalahan
    console.error("[LOGIN]", err);

    // Jika Zod error, tampilkan detailnya
    if (err instanceof z.ZodError) {
      console.log("Zod Validation Errors:", err.errors);
    }
    return res.status(400).json({ message: "Permintaan tidak valid" }); // Bad request jika ada error
  }
}
