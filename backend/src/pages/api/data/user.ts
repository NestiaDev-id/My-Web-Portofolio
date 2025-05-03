import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import verifyToken from "@/lib/middlewares/verifyToken";
import { runMiddleware } from "../../../lib/middlewares/csrf-token";
import { verifyJWT_baru } from "@/lib/middlewares/verifyJWT2";
import { parse } from "cookie";

// Wrapper utama
// async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
//   await runMiddleware(req, res);

//   // Tangani preflight OPTIONS request langsung tanpa verifikasi token
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }

//   return verifyToken(async (req, res) => {
//     const user = (req as any).user;
//     if (!user) return res.status(401).json({ message: "Unauthorized" });

//     if (req.method === "GET") {
//       try {
//         const userData = await prisma.user.findUnique({
//           where: { id: user.userId },
//           select: {
//             username: true,
//             email: true,
//             name: true,
//             aboutme: true,
//             quote: true,
//             tech_stack: true,
//             skills: true,
//             languages: true,
//             resume_url: true,
//             contact_email: true,
//             phone: true,
//             location: true,
//             lastLogin: true,
//             createdAt: true,
//             profile_picture: true,
//           },
//         });

//         if (!userData) {
//           return res.status(404).json({ message: "User not found" });
//         }

//         return res.status(200).json({
//           ...userData,
//           phone: userData.phone,
//         });
//       } catch (error) {
//         console.error("[GET USER ERROR]", error);
//         return res.status(500).json({ message: "Internal server error" });
//       }
//     }

//     if (req.method === "PATCH") {
//       try {
//         const {
//           name,
//           aboutme,
//           quote,
//           tech_stack,
//           skills,
//           languages,
//           resume_url,
//           contact_email,
//           phone,
//           location,
//         } = req.body;

//         const updatedUser = await prisma.user.update({
//           where: { id: user.userId },
//           data: {
//             name,
//             aboutme,
//             quote,
//             tech_stack,
//             skills,
//             languages,
//             resume_url,
//             contact_email,
//             phone,
//             location,
//             updatedAt: new Date(),
//           },
//         });

//         return res
//           .status(200)
//           .json({ message: "Profile updated", user: updatedUser });
//       } catch (error) {
//         console.error("[PATCH USER ERROR]", error);
//         return res.status(500).json({ message: "Internal server error" });
//       }
//     }

//     return res.status(405).json({ message: "Method not allowed" });
//   })(req, res); // jangan lupa kirim req/res ke verifyToken
// }

type JwtPayload = {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
  [key: string]: any; // jika ada properti lain yang mungkin ikut
};

// export default mainHandler;
function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = parse(req.headers.cookie || "");
  return cookies.token || null; // "token" adalah nama cookie yang berisi JWT
}
async function mainHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Cek CSRF token menggunakan middleware
    await runMiddleware(req, res);

    if (req.method === "GET") {
      const token = getTokenFromCookie(req);
      if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
      } else {
        console.log("[GET USER] Token:", token);
      }

      // Verifikasi JWT dan ambil data user
      const userData = await verifyJWT_baru(token);
      if (!userData) {
        return res.status(401).json({ message: "Token tidak valid" });
      } else {
        console.log("[GET USER] User data:", userData);
      }
      // Pastikan userData memiliki userId sebelum mengakses database
      if (!userData.userId) {
        return res
          .status(400)
          .json({ message: "userId tidak ditemukan dalam payload" });
      }
      try {
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

        return res.status(200).json({
          ...user,
          phone: user.phone,
        });
      } catch (error) {
        console.error("[GET USER ERROR]", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    // if (req.method === "PATCH") {
    //   try {
    //     const {
    //       name,
    //       aboutme,
    //       quote,
    //       tech_stack,
    //       skills,
    //       languages,
    //       resume_url,
    //       contact_email,
    //       phone,
    //       location,
    //     } = req.body;

    //     const updatedUser = await prisma.user.update({
    //       where: { id: user.userId },
    //       data: {
    //         name,
    //         aboutme,
    //         quote,
    //         tech_stack,
    //         skills,
    //         languages,
    //         resume_url,
    //         contact_email,
    //         phone,
    //         location,
    //         updatedAt: new Date(),
    //       },
    //     });

    //     return res
    //       .status(200)
    //       .json({ message: "Profile updated", user: updatedUser });
    //   } catch (error) {
    //     console.error("[PATCH USER ERROR]", error);
    //     return res.status(500).json({ message: "Internal server error" });
    //   }
    // }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export default mainHandler;
