import { RequestHandler } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { doctorService } from "./doctor.service";
import status from "http-status";

const getAllDoctors: RequestHandler = catchAsync(async (req, res) => {
  const result = await doctorService.getAllDoctors();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved all doctors successfully",
    data: result,
  });
});

const getDoctorById: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await doctorService.getDoctorById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved doctor successfully",
    data: result,
  });
});

const deleteDoctor: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await doctorService.deleteDoctor(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Deleted doctor successfully",
    data: result,
  });
});

export const doctorController = { getAllDoctors ,getDoctorById ,deleteDoctor };
