// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma"; // pastikan path ini sesuai
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, email, password } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
