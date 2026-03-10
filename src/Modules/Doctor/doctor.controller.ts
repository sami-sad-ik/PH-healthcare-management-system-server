import { RequestHandler } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { doctorService } from "./doctor.service";
import status from "http-status";

const getAllDoctors :RequestHandler =catchAsync(async (req, res ) => {
  const result = await doctorService.getAllDoctors();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved all doctors successfully",
    data: result,
  });
});

export const doctorController = {getAllDoctors}