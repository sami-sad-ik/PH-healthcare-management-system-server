import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { appointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user;
  const result = await appointmentService.bookAppointment(payload, user);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});

const bookAppointmentWithPayLater = catchAsync(async (req, res) => {
  const payload = req.body;
  const user = req.user;
  const result = await appointmentService.bookAppointmentWithPayLater(
    payload,
    user,
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});

const initiatePayment = catchAsync(async (req, res) => {
  const appointmentId = req.params.id;
  const user = req.user;
  const result = await appointmentService.initiatePayment(
    appointmentId as string,
    user,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const getMyAppointments = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await appointmentService.getMyAppointments(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

const getSingleAppointment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const result = await appointmentService.getSingleAppointment(
    id as string,
    user,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Appointment retrieved successfully",
    data: result,
  });
});

const getAllAppointments = catchAsync(async (req, res) => {
  const result = await appointmentService.getAllAppointments();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All appointments retrieved successfully",
    data: result,
  });
});

const changeAppointmentStatus = catchAsync(async (req, res) => {
  const result = await appointmentService.changeAppointmentStatus();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Appointment status changed successfully",
    data: result,
  });
});

export const appointmentController = {
  bookAppointment,
  bookAppointmentWithPayLater,
  initiatePayment,
  getMyAppointments,
  getSingleAppointment,
  getAllAppointments,
  changeAppointmentStatus,
};
