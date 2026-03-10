import z from "zod";
import { Gender } from "../../generated/prisma/enums";

export const createDoctorZodSchema = z.object({
  password : z.string('Password is required').min(6,"Password must be at least 6 characters"),
  doctor: z.object({
     name: z.string("Name must be string").max(20,"Name must be less than 20 character"),
     email: z.email(),
     contactNumber: z.string("Contact number is required").min(11,"Contact number must be at least 11 digits"),
     profilePhoto: z.string("profile photo required"),
     address: z.string("Address is required").optional(),
     registrationNumber: z.string("Registration number is required"),
     qualification: z.string("Qualification is required"),
     experience: z.int("Experience must be an integer").nonnegative("Experience can't be negative").optional(),
     gender: z.enum([Gender.MALE ,Gender.FEMALE],"Gender can be either MALE or FEMALE"),
     appointmentFee: z.number("Appointment fee must be a number").nonnegative("Appointment fee can't be negative"),
     currentWorkingPlace: z.string("Current working place is required"),
     designation: z.string("Designation is required")
  }),
  specialities: z.array(z.uuid(),"Specialities must be array of strings").min(1,"At least one speciality required")
});