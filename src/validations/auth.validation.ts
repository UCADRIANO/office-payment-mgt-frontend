import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
