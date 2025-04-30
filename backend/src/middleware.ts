import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./lib/middlewares/withAuth";

export function mainMiddleware(request: NextRequest) {
  return NextResponse.next();
}

// Bungkus dengan auth middleware
export default withAuth(mainMiddleware, [
  "/profile",
  "/blog",
  "/projects",
  "/social",
  "/about",
]);

// Konfigurasi matcher Next.js untuk medeteksi rute yang perlu dilindungi
// Ini akan memicu middleware untuk semua rute yang dimulai dengan /profile, /blog, dll.
export const config = {
  matcher: ["/profile", "/blog/:path*", "/projects", "/social", "/about"],
};
