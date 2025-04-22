import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import verifyToken from "@/lib/middleware/verifyToken";
// import { decryptPhone, encryptPhone } from "@/lib/crypto/hybrid"; // Fungsi hybrid ML-KEM + AES

const handler = async function (req: NextApiRequest, res: NextApiResponse) {
  // Pastikan token sudah terverifikasi, dan data user sudah ada di req.user
  const user = (req as any).user; // Data user dari token yang diverifikasi
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // 🟢 GET: Ambil data user
  if (req.method === "GET") {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.userId }, // Ambil user berdasarkan ID dari token
        select: {
          username: true,
          email: true,
          name: true,
          aboutme: true,
          quote: true,
          tech_stack: true,
          skills: true,
          languages: true,
          resume_url: true,
          contact_email: true,
          phone: true,
          location: true,
          lastLogin: true,
          createdAt: true,
          profile_picture: true,
        },
      });

      if (!userData) return res.status(404).json({ message: "User not found" });

      // Decrypt phone jika ada
      const decryptedPhone = userData.phone;

      return res.status(200).json({
        ...userData,
        phone: decryptedPhone,
      });
    } catch (error) {
      console.error("[GET USER]", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // 🟡 PATCH: Update data user
  else if (req.method === "PATCH") {
    try {
      const {
        name,
        aboutme,
        quote,
        tech_stack,
        skills,
        languages,
        resume_url,
        contact_email,
        phone,
        location,
      } = req.body;

      const encryptedPhone = phone;

      const updatedUser = await prisma.user.update({
        where: { id: user.userId }, // Update user berdasarkan ID dari token
        data: {
          name,
          aboutme,
          quote,
          tech_stack,
          skills,
          languages,
          resume_url,
          contact_email,
          phone: encryptedPhone,
          location,
          updatedAt: new Date(),
        },
      });

      return res
        .status(200)
        .json({ message: "Profile updated", user: updatedUser });
    } catch (error) {
      console.error("[PATCH USER]", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // ❌ Method tidak diperbolehkan
  return res.status(405).json({ message: "Method not allowed" });
};

export default verifyToken(handler);
