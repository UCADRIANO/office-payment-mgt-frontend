import { z } from "zod";

export const loginSchema = z.object({
  army_number: z.string().min(5, "Army number is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Old password is required"),
  new_password: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
