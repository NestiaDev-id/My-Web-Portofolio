import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().url().optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_CHAT_MODEL: z.string().default("llama-3.1-8b-instant"),
  LLM_SERVICE_URL: z.string().url().optional(),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB_NAME: z.string().min(1).default("nestiadev"),
  REDIS_URL: z.string().url().optional(),
  REDIS_MAX_HISTORY: z.coerce.number().int().positive().max(500).default(100),
  REDIS_SESSION_TTL_MINUTES: z.coerce.number().int().min(30).max(360).default(45),
  RATE_LIMIT_GENERAL_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_CHAT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_PRESENCE_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  PRESENCE_TTL_SECONDS: z.coerce.number().int().min(20).max(120).default(35),
  HF_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(5).default(2),
  HF_QUEUE_TIMEOUT_SECONDS: z.coerce.number().int().min(5).max(120).default(30),
});

export const env = envSchema.parse(process.env);
