import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../Middleware/validateRequest";
import { createAdminValidationSchema, createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor", validateRequest(createDoctorZodSchema), userController.createDoctor);
router.post("/create-admin", validateRequest(createAdminValidationSchema), userController.createAdmin);

export const userRoute = router;
