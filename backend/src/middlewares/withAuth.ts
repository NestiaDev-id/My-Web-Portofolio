import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

const onlyAdmin = ["/admin"];

// Fungsi higher-order middleware: menerima middleware asli + daftar rute yang perlu autentikasi
export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: String[] = []
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathName = req.nextUrl.pathname; // Ambil path dari URL yang diminta user

    // Cek apakah path termasuk rute yang harus autentikasi
    if (requireAuth.includes(pathName)) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET, // Gunakan secret untuk decode token JWT
      });

      // Jika tidak ada token, redirect ke halaman login
      if (!token) {
        const url = new URL("/auth/login", req.url); // Buat URL login
        url.searchParams.set("callbackUrl", encodeURI(req.url)); // Simpan tujuan awal user agar bisa diarahkan kembali setelah login
        return NextResponse.redirect(url);
      }

      // Jika user login tapi bukan admin, dan mencoba akses route admin
      if (token.role !== "admin" && onlyAdmin.includes(pathName)) {
        return NextResponse.redirect(new URL("/", req.url)); // Arahkan ke home
      }
    }

    return middleware(req, next); // Jika lolos semua pengecekan, lanjut ke middleware utama
  };
}
