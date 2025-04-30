"use client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import crypto from "crypto";
import argon2 from "argon2";
import { emailLimiter, globalLimiter } from "@/lib/security/limiter";
import { loginSchema } from "@/lib/validation/login.schema";
import { createJWT } from "@/lib/security/jwt";

const isProd = process.env.NODE_ENV === "production";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    if (req.cookies.token) {
      return res.status(200).json({ message: "User already logged in" });
    }

    await globalLimiter.check(req, res);

    await emailLimiter.check(req, res);

    const { email, password } = loginSchema.parse(req.body);
    if (email !== process.env.ALLOWED_USER_EMAIL) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const stripped = user.password.replace("$argon2id$", "");
    const original = `$argon2id$${stripped}`;
    const valid = await argon2.verify(original, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await prisma.user.update({
      where: { email },
      data: { lastLogin: new Date() },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iss: "SecureApp",
      aud: "SecureClient",
      sub: "user-authentication",
      jti: crypto.randomUUID(),
    };

    // Generate JWT token
    const jwt = createJWT(payload);

    res.setHeader(
      "Set-Cookie",
      `token=${jwt}; Path=/; Max-Age=3600; SameSite=Strict; Secure${
        isProd ? "; HttpOnly" : ""
      }`
    );

    // Generate CSRF token

    // const csrfToken =

    return res.status(200).json({ message: "Login berhasil", token: jwt });
  } catch (err) {
    console.error("[LOGIN]", err);
    return res.status(400).json({ message: "Bad Request" });
  }
}
