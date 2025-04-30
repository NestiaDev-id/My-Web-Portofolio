import { LRUCache } from "lru-cache";
import type { NextApiRequest, NextApiResponse } from "next";

type RateLimitOptions = {
  max: number;
  windowMs: number;
  keyGenerator: (req: NextApiRequest) => string;
};

export default function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number>({
    max: 500,
    ttl: options.windowMs,
  });

  return {
    check: (req: NextApiRequest, res: NextApiResponse) => {
      const token = options.keyGenerator(req);
      const tokenCount = Number(tokenCache.get(token) || 0);

      if (process.env.NODE_ENV === "development") return;

      if (tokenCount >= options.max) {
        res
          .status(429)
          .json({ message: "Terlalu banyak percobaan, coba lagi nanti." });
        throw new Error("Rate limit exceeded");
      }

      tokenCache.set(token, tokenCount + 1);
    },
  };
}
