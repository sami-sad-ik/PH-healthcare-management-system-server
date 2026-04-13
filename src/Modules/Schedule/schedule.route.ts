import { Router } from "express";
import {
  createScheduleZodSchema,
  updateScheduleZodSchema,
} from "./schedule.validation";
import { scheduleController } from "./schedule.controller";
import { validateRequest } from "../../Middleware/validateRequest";

const router = Router();

router.post(
  "/",
  validateRequest(createScheduleZodSchema),
  scheduleController.createSchedule,
);
router.get("/", scheduleController.getAllSchedules);
router.get("/:id", scheduleController.getScheduleById);
router.patch(
  "/:id",
  validateRequest(updateScheduleZodSchema),
  scheduleController.updateSchedule,
);
router.delete("/:id", scheduleController.deleteSchedule);
