import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import {
  IChangeUserRole,
  IChangeUserStatus,
  IUpdateAdmin,
} from "./admin.interface";
import { IAuthUser } from "../Auth/auth.interface";
import { IRequestUser } from "../../interfaces/interface";

const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
    },
  });

  return result;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });
  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }
  return admin;
};

const deleteAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });
  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }
  if (admin.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Admin already deleted");
  }
  await prisma.admin.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

const updateAdmin = async (
  id: string,
  payload: IUpdateAdmin,
  currentUser: IAuthUser,
) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });
  if (!admin) {
    throw new AppError(status.NOT_FOUND, "admin not found");
  }
  if (currentUser.role === Role.ADMIN && currentUser.email !== admin.email) {
    throw new AppError(status.FORBIDDEN, "You can only update your profile!");
  }

  const result = await prisma.admin.update({
    where: { id },
    data: { ...payload },
  });
  return result;
};

const changeUserStatus = async (
  user: IRequestUser,
  payload: IChangeUserStatus,
) => {
  //1. Super Admin can change status of any user (Admin, Doctor, Patient) except him and other Super Admins
  //2. Admin can change status of Doctor and Patient except himself and other Admins and Super Admins
  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });
  const { userId, userStatus } = payload;
  const userToUpdateStatus = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const selfStatusChange = user.id === userId;
  if (selfStatusChange) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change your own status!",
    );
  }
  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToUpdateStatus.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Admin cannot change status of Super Admin! Only Super Admin can change status of Super Admin",
    );
  }
  if (userToUpdateStatus.role === Role.ADMIN) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of another Admin!",
    );
  }
  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to DELETED! To Delete user use delete API to delete the user. For Example, if you want to delete a doctor, use delete API to delete the doctor. This will set the user status to DELETED.",
    );
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus },
  });
  return updatedUser;
};

const changeUserRole = async (user: IRequestUser, payload: IChangeUserRole) => {
  //1. Super Admin can change role of other super admins and admins except him
  //2. Admin cannot change role of any user
  //role of doctor and patient cannot be changed by anyone. If needed, they need to delete the user and create a new user with the desired role.
  const isSuperAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });
  const { userId, userRole } = payload;
  const userToUpdateRole = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const selfRoleChange = user.id === userId;
  if (selfRoleChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role!");
  }
  if (
    userToUpdateRole.role === Role.DOCTOR ||
    userToUpdateRole.role === Role.PATIENT
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the role of Doctor or Patient! If you want to change the role of Doctor or Patient, you need to delete the user and create a new user with the desired role.",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: userRole },
  });
  return updatedUser;
};

export const adminService = {
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
  changeUserStatus,
  changeUserRole,
};
