import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid")
    .refine(
      (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email) && email.endsWith("@gmail.com");
      },
      {
        message: "Email harus menggunakan domain @gmail.com",
      }
    ),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
