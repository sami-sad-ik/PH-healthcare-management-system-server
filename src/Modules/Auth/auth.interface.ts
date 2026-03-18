import { Role, UserStatus } from "../../generated/prisma/enums";

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  isDeleted: boolean;
  emailVerified: boolean;
}

export interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
