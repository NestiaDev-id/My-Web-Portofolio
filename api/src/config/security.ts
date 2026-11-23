import { env } from "./env.js";

const developmentOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:4173",
]);

const configuredOrigins = new Set(
  env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
);

export function isAllowedOrigin(origin: string): boolean {
  if (env.NODE_ENV !== "production" && developmentOrigins.has(origin)) return true;
  return configuredOrigins.has(origin) || env.FRONTEND_URL === origin;
}
