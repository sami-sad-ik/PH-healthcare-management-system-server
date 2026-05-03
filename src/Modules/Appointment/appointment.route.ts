import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.post(
  "/book-appointment",
  checkAuth(Role.PATIENT),
  appointmentController.bookAppointment,
);
router.post(
  "/book/pay-later",
  checkAuth(Role.PATIENT),
  appointmentController.bookAppointmentWithPayLater,
);
router.post("/initiate-payment/:id", appointmentController.initiatePayment);

export const appointmentRoute = router;
