// scripts/seed-user.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("12345678", 10);

  const user = await prisma.user.upsert({
    where: { email: "budi@gmail.com" },
    update: {},
    create: {
      email: "budi@gmail.com",
      password: hash,
    },
  });

  console.log("User created:", user);
}

main().finally(() => prisma.$disconnect());
