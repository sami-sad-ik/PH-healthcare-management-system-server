import { Router } from "express";
import {
  createScheduleZodSchema,
  updateScheduleZodSchema,
} from "./schedule.validation";
import { scheduleController } from "./schedule.controller";
import { validateRequest } from "../../Middleware/validateRequest";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createScheduleZodSchema),
  scheduleController.createSchedule,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  scheduleController.getAllSchedules,
);
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  scheduleController.getScheduleById,
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateScheduleZodSchema),
  scheduleController.updateSchedule,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  scheduleController.deleteSchedule,
);

export const scheduleRoute = router;
