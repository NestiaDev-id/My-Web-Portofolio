import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import crypto from "crypto";
import argon2 from "argon2";
import { globalLimiter } from "@/lib/security/limiter";
import { registerSchema } from "@/lib/validation/register.schema";
import { createJWT } from "@/lib/security/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Rate limiting by IP address

    await globalLimiter.check(req, res);

    // Validate input data
    const { username, email, password } = registerSchema.parse(req.body);

    // Check if email already exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // just one single-email user allowed from env
    if (email !== process.env.ALLOWED_USER_EMAIL) {
      return res
        .status(401)
        .json({ message: "Login gagal", error: "Unauthorized" }); // Unauthorized jika email tidak cocok
    }

    // Hash the user's password
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // argon2id is the most secure option, combining both versions of Argon2
      hashLength: 128, // 128 bytes (2048-bit) — sangat panjang!
      salt: crypto.randomBytes(64), // Salt 64 byte (512-bit entropy)
      timeCost: 12, // Butuh lebih banyak waktu (CPU cycles)
      memoryCost: 1 << 21, // 2 GiB RAM — maksimum realistis untuk server kuat
      parallelism: 4, // Optimalkan multicore (butuh banyak threadpool)
    });

    const stripped = hashedPassword.replace("$argon2id$", ""); // atau simpan semua di Base64 terpisah

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: stripped,
        // Optional tapi baiknya diisi default:
        name: username, // default name sama dengan username
        profile_picture: null,
        aboutme: null,
        quote: [],
        tech_stack: [],
        skills: [],
        languages: [],
        resume_url: null,
        contact_email: null,
        phone: null,
        location: null,
        lastLogin: new Date(),
        createdAt: new Date(),
      },
    });

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
      iss: "SecureApp",
      aud: "SecureClient",
      sub: "user-authentication",
      jti: crypto.randomUUID(),
    };

    const jwt = createJWT(payload);

    // Set the token as a cookie
    res.setHeader(
      "Set-Cookie",
      `token=${jwt}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure`
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("[REGISTER]", err);
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: err.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
