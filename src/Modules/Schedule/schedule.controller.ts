import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { scheduleService } from "./schedule.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createSchedule = catchAsync(async (req, res) => {
  const payload = req.body;
  const schedule = scheduleService.createSchedule(payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Schedule created successfully",
    data: schedule,
  });
});

const getAllSchedules = catchAsync(async (req, res) => {
  const query = req.query;
  const schedules = await scheduleService.getAllSchedules(
    query as IQueryParams,
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedules retrieved successfully",
    data: schedules,
  });
});

const getScheduleById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const schedule = await scheduleService.getScheduleById(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule retrieved successfully",
    data: schedule,
  });
});

const updateSchedule = catchAsync(async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  const schedule = await scheduleService.updateSchedule(id as string, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule updated successfully",
    data: schedule,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const id = req.params.id;
  await scheduleService.deleteSchedule(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule deleted successfully",
  });
});

export const scheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
