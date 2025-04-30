import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z
    .string()
    .email()
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Only @gmail.com addresses are allowed",
    }),
  password: z.string().min(6),
});
