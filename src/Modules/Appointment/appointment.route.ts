import { Router } from "express";
import { appointmentController } from "./appointment.controller";

const router = Router();

router.post("/book", appointmentController.bookAppointment);
router.post(
  "/book/pay-later",
  appointmentController.bookAppointmentWithPayLater,
);
router.post("/initiate-payment/:id", appointmentController.initiatePayment);

export const appointmentRoute = router;
