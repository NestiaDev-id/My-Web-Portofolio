import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  console.error("Unhandled API error", error);
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan internal pada server.",
      },
      meta: { timestamp: new Date().toISOString() },
    },
    500,
  );
};
