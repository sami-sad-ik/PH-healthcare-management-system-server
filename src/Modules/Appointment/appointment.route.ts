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
router.get(
  "/my-appointments",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  appointmentController.getMyAppointments,
);
router.get(
  "/all-appointments",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  appointmentController.getAllAppointments,
);
router.get(
  "/my-appointments/:id",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  appointmentController.getMySingleAppointment,
);
router.patch(
  "/change-appointment-status/:id",
  checkAuth(),
  appointmentController.changeAppointmentStatus,
);
router.post(
  "/book/pay-later",
  checkAuth(Role.PATIENT),
  appointmentController.bookAppointmentWithPayLater,
);
router.post(
  "/initiate-payment/:id",
  checkAuth(Role.PATIENT),
  appointmentController.initiatePayment,
);

export const appointmentRoute = router;
