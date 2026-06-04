import { RequestHandler } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IAuthUser } from "../Auth/auth.interface";

const getAllAdmins: RequestHandler = catchAsync(async (req, res) => {
  const result = await adminService.getAllAdmins();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: result,
  });
});

const getAdminById: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await adminService.getAdminById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

const deleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await adminService.deleteAdmin(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  const currentUser = req.user as IAuthUser;
  const result = await adminService.updateAdmin(
    id as string,
    payload,
    currentUser,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

const changeUserStatus: RequestHandler = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await adminService.changeUserStatus(user, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User status changed successfully",
    data: result,
  });
});

const changeUserRole: RequestHandler = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await adminService.changeUserRole(user, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User role changed successfully",
    data: result,
  });
});

export const adminController = {
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
  changeUserStatus,
  changeUserRole,
};
