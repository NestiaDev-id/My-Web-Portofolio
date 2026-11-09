import { z } from "zod";

function safeInt(defaultValue: number, min = 1, max = 10_000) {
  return z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return defaultValue;
    if (typeof val === "string") {
      const cleaned = val.replace(/^["'\s]+|["'\s]+$/g, "");
      const num = Number(cleaned);
      return Number.isNaN(num) ? defaultValue : num;
    }
    return typeof val === "number" ? val : defaultValue;
  }, z.number().int().min(min).max(max).default(defaultValue));
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.preprocess(
    (val) => (typeof val === "string" ? val.trim().replace(/\/+$/, "") : val),
    z.string().url().optional(),
  ),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_CHAT_MODEL: z.string().default("llama-3.1-8b-instant"),
  LLM_SERVICE_URL: z.string().url().optional(),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB_NAME: z.string().min(1).default("nestiadev"),
  REDIS_URL: z.preprocess(
    (val) => (typeof val === "string" ? val.trim().replace(/^["']|["']$/g, "") : val),
    z.string().min(1).optional(),
  ),
  REDIS_MAX_HISTORY: safeInt(100, 1, 500),
  REDIS_SESSION_TTL_MINUTES: safeInt(45, 30, 360),
  RATE_LIMIT_GENERAL_MAX: safeInt(60, 1, 10_000),
  RATE_LIMIT_CHAT_MAX: safeInt(30, 1, 10_000),
  RATE_LIMIT_PRESENCE_MAX: safeInt(120, 1, 10_000),
  RATE_LIMIT_WINDOW_SECONDS: safeInt(60, 1, 3600),
  PRESENCE_TTL_SECONDS: safeInt(35, 20, 120),
  HF_MAX_CONCURRENCY: safeInt(2, 1, 5),
  HF_QUEUE_TIMEOUT_SECONDS: safeInt(30, 5, 120),
});

export const env = envSchema.parse(process.env);
