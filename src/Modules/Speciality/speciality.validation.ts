import z from "zod";

export const createSpecialityZodSchema = z.object({
  title: z.string("Title is required"),
  description: z.string("Description is required").optional(),
});
