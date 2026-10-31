import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().url().optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB_NAME: z.string().min(1).default("nestiadev"),
  REDIS_URL: z.string().url().optional(),
  REDIS_MAX_HISTORY: z.coerce.number().int().positive().max(500).default(100),
  RATE_LIMIT_GENERAL_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_CHAT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
});

export const env = envSchema.parse(process.env);
