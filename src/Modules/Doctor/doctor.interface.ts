import { Gender, Role, UserStatus } from "../../generated/prisma/enums";

export interface IUpdateDoctor {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  registrationNumber?: string;
  experience?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  specialities?: string[];
}

export interface IAuthUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  isDeleted: boolean;
  emailVerified: boolean;
}
