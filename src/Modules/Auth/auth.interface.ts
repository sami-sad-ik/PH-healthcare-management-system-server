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