import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middlewares/withAuth";

// Fungsi utama middleware, isinya default karena hanya dipakai untuk dibungkus oleh withAuth
export function mainMiddleware(request: NextRequest) {
  const res = NextResponse.next(); // Lanjut ke request selanjutnya (jika lolos auth)
}

// Buat empty array untuk "requireAuth", karena kita akan handle semua di dalam withAuth
export default withAuth(mainMiddleware);
