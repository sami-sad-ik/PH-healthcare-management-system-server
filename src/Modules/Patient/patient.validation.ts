import z from "zod";
import {
  BloodGroup,
  Gender,
  MaritalStatus,
} from "../../generated/prisma/enums";

const updatePatientZodSchema = z.object({
  patientInfo: z
    .object({
      name: z
        .string("Name must be a string")
        .min(1, "Name can't be empty")
        .max(100, "Name can't be more than 100 characters")
        .optional(),
      profilePhoto: z.url("Profile photo must be a valid URL").optional(),
      contactNumber: z
        .string("Contact number must be a string")
        .min(1, "Contact number can't be empty")
        .optional(),
      address: z
        .string("Address must be a string")
        .min(1, "Address can't be empty")
        .max(200, "Address can't be more than 200 characters")
        .optional(),
    })
    .optional(),
  patientHealthData: z
    .object({
      dateOfBirth: z.string("Date of birth must be a string").optional(),
      gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
      bloodGroup: z
        .enum([
          BloodGroup.O_POSITIVE,
          BloodGroup.O_NEGATIVE,
          BloodGroup.A_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.AB_NEGATIVE,
        ])
        .optional(),
      hasAllergies: z.boolean().optional(),
      hasDiabetes: z.boolean().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      smokingStatus: z.boolean().optional(),
      dieteryPreferences: z.string().optional(),
      pregnancyStatus: z.boolean().optional(),
      mentalHealthStatus: z.string().optional(),
      immunizationStatus: z.string().optional(),
      hasPastSurgeries: z.boolean().optional(),
      recentAnxiety: z.boolean().optional(),
      recentDepression: z.boolean().optional(),
      maritalStatus: z
        .enum([
          MaritalStatus.MARRIED,
          MaritalStatus.UNMARRIED,
          MaritalStatus.DIVORCED,
          MaritalStatus.WIDOWED,
        ])
        .optional(),
    })
    .optional(),
  medicalReports: z
    .array(
      z.object({
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional(),
        reportName: z.string().optional(),
        reportUrl: z.url().optional(),
      }),
    )
    .optional(),
});
