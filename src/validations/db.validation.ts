import z from "zod";

export const dbSchema = z.object({
  name: z.string().min(1, "Name is required"),
  short_code: z.string().min(1, "Short code is required"),
  description: z.string(),
});

export type DbFormType = z.infer<typeof dbSchema>;
