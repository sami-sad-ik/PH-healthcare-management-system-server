import z from "zod";
import { Gender } from "../../generated/prisma/enums";

export const updateDoctorZodSchema = z.object({
  name: z.string().max(20, "Name must be less than 20 characters").optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z
    .string()
    .min(11, "Contact number must be at least 11 digits")
    .optional(),
  registrationNumber: z.string().optional(),
  address: z.string().optional(),
  experience: z
    .number()
    .int("Experience must be an integer")
    .nonnegative("Experience can't be negative")
    .optional(),
  qualification: z.string().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
  appointmentFee: z
    .number()
    .nonnegative("Appointment fee can't be negative")
    .optional(),
  currentWorkingPlace: z.string().optional(),
  designation: z.string().optional(),
  specialities: z
    .array(z.string().uuid("Each speciality must be a valid UUID"))
    .optional(),
});
