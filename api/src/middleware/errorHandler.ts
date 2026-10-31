import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof HTTPException) {
    if (error.status === 413) {
      return c.json(
        {
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "Ukuran payload melebihi batas yang diizinkan.",
          },
          meta: { timestamp: new Date().toISOString() },
        },
        413,
      );
    }
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
