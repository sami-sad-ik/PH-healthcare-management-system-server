import { RequestHandler } from "express";
import { specialityService } from "./speciality.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createSpeciality: RequestHandler = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await specialityService.createSpeciality(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Speciality created successfully",
    data: result,
  });
});

const getAllSpecialities: RequestHandler = catchAsync(async (req, res) => {
  const result = await specialityService.getAllSpecialities();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Successfully retrieved specialities",
    data: result,
  });
});

const deleteSpeciality: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await specialityService.deleteSpeciality(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speciality deleted successfully",
    data: result,
  });
});

const updateSpeciality: RequestHandler = catchAsync(async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const result = await specialityService.updateSpeciality(id as string, body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speciality updated successfully",
    data: result,
  });
});

export const specialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
  updateSpeciality,
};
