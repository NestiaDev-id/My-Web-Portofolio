import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import verifyToken from "@/lib/middlewares/verifyToken";
import { runMiddleware } from "../../../lib/middlewares/csrf-token";

// Wrapper utama
async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);

  // Tangani preflight OPTIONS request langsung tanpa verifikasi token
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return verifyToken(async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "GET") {
      try {
        const userData = await prisma.user.findUnique({
          where: { id: user.userId },
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

        if (!userData) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
          ...userData,
          phone: userData.phone,
        });
      } catch (error) {
        console.error("[GET USER ERROR]", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    if (req.method === "PATCH") {
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

        const updatedUser = await prisma.user.update({
          where: { id: user.userId },
          data: {
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
            updatedAt: new Date(),
          },
        });

        return res
          .status(200)
          .json({ message: "Profile updated", user: updatedUser });
      } catch (error) {
        console.error("[PATCH USER ERROR]", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  })(req, res); // jangan lupa kirim req/res ke verifyToken
}

export default mainHandler;
