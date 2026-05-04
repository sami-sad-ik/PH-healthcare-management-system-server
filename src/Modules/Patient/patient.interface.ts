import {
  BloodGroup,
  Gender,
  MaritalStatus,
} from "../../generated/prisma/enums";

export interface IUpdatePatientInfoPayload {
  name?: string;
  profile?: string;
  age?: number;
  address?: string;
}

export interface IUpdatePatientHealthDataPayload {
  dateOfBirth?: Date;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height?: string;
  weight?: string;
  smokingStatus?: boolean;
  dieteryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthStatus?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
}

export interface IUpdatePatientMedicalReportPayload {
  reportName: string;
  reportUrl: string;
  shouldDelete: boolean;
  reportId: string;
}

export interface IUpdatePatientProfilePayload {
  patientInfo?: IUpdatePatientInfoPayload;
  patientHealthData?: IUpdatePatientHealthDataPayload;
  medicalReports?: IUpdatePatientMedicalReportPayload[];
}
