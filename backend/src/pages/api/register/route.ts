// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  // Validasi
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Cek apakah user sudah ada
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Simpan user baru
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ message: "User registered successfully", user });
}
