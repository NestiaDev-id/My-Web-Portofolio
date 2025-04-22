import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middlewares/withAuth";

// Fungsi middleware utama, hanya meneruskan permintaan
export function mainMiddleware(request: NextRequest) {
  return NextResponse.next(); // Penting! Harus return response
}

// Bungkus dengan auth middleware
export default withAuth(mainMiddleware, [
  "/",
  "/profile",
  "/blog",
  "/projects",
  "/social",
  "/about",
]);
