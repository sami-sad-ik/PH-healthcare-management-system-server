import { RequestHandler } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { patientService } from "./patient.service";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const updateMyProfile: RequestHandler = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await patientService.updatePatient(user, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Patient profile updated successfully",
    data: result,
  });
});

export const patientController = {
  updateMyProfile,
};
