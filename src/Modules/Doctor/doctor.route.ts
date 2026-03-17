import { Router } from "express";
import { doctorController } from "./doctor.controller";
import checkAuth from "../../Middleware/checkAuth";
import { validateRequest } from "../../Middleware/validateRequest";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.delete(
  "/:id",
  checkAuth("DOCTOR", "ADMIN", "SUPER_ADMIN"),
  doctorController.deleteDoctor,
);
router.patch(
  "/:id",
  checkAuth("DOCTOR", "ADMIN", "SUPER_ADMIN"),
  validateRequest(updateDoctorZodSchema),
  doctorController.updateDoctor,
);

export const doctorRoute = router;
