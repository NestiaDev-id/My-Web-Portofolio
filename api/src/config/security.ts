import { env } from "./env.js";

const staticOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:4173",
  "https://nestiadev.vercel.app",
]);

export function isAllowedOrigin(origin: string): boolean {
  if (env.FRONTEND_URL === origin) return true;
  if (staticOrigins.has(origin)) return true;

  try {
    const url = new URL(origin);

    if (url.protocol !== "https:") return false;

    const hostname = url.hostname;
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}
