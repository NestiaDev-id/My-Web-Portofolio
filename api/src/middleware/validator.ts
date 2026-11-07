import type { Context, MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";

export function validateJson<T>(
  schema: ZodSchema<T>,
): MiddlewareHandler<{
  Variables: { validatedBody: T };
}> {
  return async (c: Context, next) => {
    const payload = await c.req.json().catch(() => undefined);
    const result = schema.safeParse(payload);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Payload request tidak valid.",
            issues: result.error.flatten().fieldErrors,
          },
          meta: { timestamp: new Date().toISOString() },
        },
        400,
      );
    }

    c.set("validatedBody", result.data);
    await next();
  };
}
