import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";

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

const getAllDoctorSchedule = catchAsync(async (req, res) => {
  const result = await doctorScheduleService.getAllDoctorSchedule();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Retrieved all doctor schedules successfully",
    data: result,
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
  const result = await doctorScheduleService.deleteDoctorSchedule(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Deleted doctor schedule successfully",
    data: result,
  });
});
