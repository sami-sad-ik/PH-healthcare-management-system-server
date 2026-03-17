import z from "zod";

export const updateAdminZodSchema = z.object({
  name: z.string().max(20, "Name must be less than 20 characters").optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z
    .string()
    .min(11, "Contact number must be at least 11 digits")
    .optional(),
});
