import { z } from "zod";

export const loginSchema = z.object({
  army_number: z.string().min(5, "Army number is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
