import { Role, UserStatus } from "../../generated/prisma/enums";

export interface IUpdateAdmin {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
}

export interface IChangeUserStatus {
  userId: string;
  userStatus: UserStatus;
}

export interface IChangeUserRole {
  userId: string;
  userRole: Role;
}
