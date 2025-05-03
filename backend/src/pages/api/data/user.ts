import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { runCorsMiddleware } from "../../../lib/middlewares/cors";
import { verifyJWT_baru } from "@/lib/middlewares/verifyJWT2";
import { parse } from "cookie";

// Helper untuk mengambil token dari cookie
function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || "");
  return cookies.token || null; // "token" adalah nama cookie yang berisi JWT
}

async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Cek CORS
    await runCorsMiddleware(req, res);

    // Cek metode request
    if (req.method === "GET") {
      console.log("[GET] Method:", req.method);
      // Jika data yang diminta adalah data publik
      if (req.query.type === "public") {
        console.log("[GET] Type:", req.query.type);
        // Ambil data publik tanpa perlu token
        const publicData = await prisma.user.findUnique({
          where: {
            id: Array.isArray(req.query.userId)
              ? req.query.userId[0]
              : req.query.userId,
          }, // Menggunakan query parameter untuk id user
          select: {
            username: true,
            name: true,
            aboutme: true,
            quote: true,
            tech_stack: true,
            skills: true,
            languages: true,
            profile_picture: true,
            location: true,
          },
        });

        if (!publicData) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(publicData);
      }

      // Data privat membutuhkan token
      const token = getTokenFromCookie(req);
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      }

      // Verifikasi token untuk mendapatkan userId
      const userData = await verifyJWT_baru(token);
      if (!userData || !userData.userId) {
        return res.status(401).json({ message: "Token tidak valid" });
      }

      // Ambil data privat dari database
      const user = await prisma.user.findUnique({
        where: { id: userData.userId },
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

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    }

    if (req.method === "PATCH") {
      const token = getTokenFromCookie(req);
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      }

      const userData = await verifyJWT_baru(token);
      if (!userData || !userData.userId) {
        return res.status(401).json({ message: "Token tidak valid" });
      }

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
        where: { id: userData.userId },
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
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default mainHandler;
