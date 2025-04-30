import rateLimit from "@/lib/security/rate-limit";

// Global rate limiter (per IP)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) =>
    req.headers.get("x-forwarded-for") || req.ip || "global",
});

// User-specific limiter (per email)
export const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: async (req) => {
    const body = await req.json();
    return body.email;
  },
});
