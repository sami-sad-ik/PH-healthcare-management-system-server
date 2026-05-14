import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { prescriptionService } from "./prescription.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const givePrescription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await prescriptionService.givePrescription(payload, user);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const getAllPrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.getAllPrescriptions();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription retrieved successfully",
    data: result,
  });
});

const myPrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await prescriptionService.myPrescriptions(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription retrieved successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(
  async (req: Request, res: Response) => {},
);

const deletePrescription = catchAsync(
  async (req: Request, res: Response) => {},
);

export const PrescriptionController = {
  givePrescription,
  getAllPrescription,
  myPrescription,
  updatePrescription,
  deletePrescription,
};
