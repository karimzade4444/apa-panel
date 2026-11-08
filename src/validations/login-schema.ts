import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().trim().min(3, "Введите логин или email"),
  password: z.string().min(6, "Введите пароль"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
