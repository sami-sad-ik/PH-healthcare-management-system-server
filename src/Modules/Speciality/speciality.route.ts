import { Router } from "express";
import { specialityController } from "./speciality.controller";
import { multerUpload } from "../../config/multer.config";
import checkAuth from "../../Middleware/checkAuth";
import { validateRequest } from "../../Middleware/validateRequest";
import { createSpecialityZodSchema } from "./speciality.validation";

const router = Router();

router.post(
  "/",
  //   checkAuth("ADMIN", "SUPER_ADMIN"),
  multerUpload.single("file"),
  validateRequest(createSpecialityZodSchema),
  specialityController.createSpeciality,
);
router.get("/", specialityController.getAllSpecialities);
router.delete("/:id", specialityController.deleteSpeciality);
router.put("/:id", specialityController.updateSpeciality);

export const specialityRoute = router;
