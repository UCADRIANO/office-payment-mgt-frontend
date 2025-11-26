import { z } from "zod";

export const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  army_number: z.string().min(1, "Army number is required"),
  role: z.enum(["user", "admin"], "Role is required"),
  allowed_dbs: z
    .array(z.string())
    .nonempty("At least one database must be selected"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type CreateUserSchemaType = z.infer<typeof userSchema>;

export const EmployeeFormSchema = (isEditing: boolean) =>
  z
    .object({
      armyNumber: z.string().nonempty("Army Number is required"),
      rank: z.string().nonempty("Rank is required"),
      firstName: z.string().nonempty("First name is required"),
      middleName: z.string().optional(),
      lastName: z.string().nonempty("Last name is required"),
      phoneNumber: z.string().nonempty("Phone number is required"),
      bankName: z.string().nonempty("Bank is required"),
      accountNumber: z.string().nonempty("Account number is required"),
      subSector: z.string().nonempty("Sub sector is required"),
      location: z.string().optional(),
      remark: z.string().optional(),
    })
    .partial()
    .refine((data) => {
      if (isEditing) return true;
      return Object.keys(data).length > 0;
    });
