import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.createDoctorSchedule,
);
router.get(
  "/my-schedule",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.getMyDoctorSchedule,
);
router.get(
  "/all-schedules",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getAllDoctorSchedule,
);
router.get(
  "/:doctorId/schedules/:scheduleId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getDoctorScheduleById,
);
router.put(
  "/:id",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.updateDoctorSchedule,
);
router.delete(
  "/:id",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.deleteDoctorschedule,
);

export const doctorScheduleRoute = router;
