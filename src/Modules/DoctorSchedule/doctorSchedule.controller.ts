import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await doctorScheduleService.createDoctorSchedule(
    user,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Created doctor schedule successfully",
    data: result,
  });
});

const getMyDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;
  const query = req.query;
  const result = await doctorScheduleService.getMyDoctorSchedule(
    user,
    query as IQueryParams,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved your schedules successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllDoctorSchedule = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await doctorScheduleService.getAllDoctorSchedule(
    query as IQueryParams,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved doctor schedules successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getDoctorScheduleById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await doctorScheduleService.getDoctorScheduleById(
    id as string,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved doctor schedule successfully",
    data: result,
  });
});

const updateDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await doctorScheduleService.updateDoctorSchedule(
    user,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Updated doctor schedule successfully",
    data: result,
  });
});

const deleteDoctorschedule = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const result = await doctorScheduleService.deleteDoctorSchedule(
    id as string,
    user,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Deleted doctor schedule successfully",
    data: result,
  });
});

export const doctorScheduleController = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorschedule,
};
