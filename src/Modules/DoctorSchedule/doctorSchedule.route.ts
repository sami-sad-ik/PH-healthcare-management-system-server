import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedule.controller";

const router = Router();

router.post("/", doctorScheduleController.createDoctorSchedule);
router.get("/my-schedule", doctorScheduleController.getMyDoctorSchedule);
router.get("/all-schedules", doctorScheduleController.getAllDoctorSchedule);
router.get(
  "/:doctorId/schedules/:scheduleId",
  doctorScheduleController.getDoctorScheduleById,
);
router.put("/:id", doctorScheduleController.updateDoctorSchedule);
router.delete("/:id", doctorScheduleController.deleteDoctorschedule);
