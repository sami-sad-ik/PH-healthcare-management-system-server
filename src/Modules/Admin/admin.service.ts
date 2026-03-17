import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Role } from "../../generated/prisma/enums";
import { IUpdateAdmin } from "./admin.interface";
import { IAuthUser } from "../Auth/auth.interface";

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

export const adminService = {
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
};
