import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { scheduleService } from "./schedule.service";

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
  const schedules = await scheduleService.getAllSchedules();
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedules retrieved successfully",
    data: schedules,
  });
});

const getScheduleById = catchAsync(async (req, res) => {
  const id = req.params.id;
  const schedule = await scheduleService.getScheduleById(id);
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
  const schedule = await scheduleService.updateSchedule(id, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule updated successfully",
    data: schedule,
  });
});

const deleteSchedule = catchAsync(async (req, res) => {
  const id = req.params.id;
  await scheduleService.deleteSchedule(id);
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
