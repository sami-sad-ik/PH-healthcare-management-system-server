import { NextFunction, Request, Response, Router } from "express";
import { patientController } from "./patient.controller";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../Middleware/validateRequest";
import { patientValidation } from "./patient.validation";
import { multerUpload } from "../../config/multer.config";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";

const router = Router();

router.patch(
  "/update-my-profile",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  updateMyPatientProfileMiddleware,
  validateRequest(patientValidation.updatePatientZodSchema),
  patientController.updateMyProfile,
);

export const patientRoute = router;
