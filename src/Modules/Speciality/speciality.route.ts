import { Router } from "express";
import { specialityController } from "./speciality.controller";

const router = Router();

router.post("/", specialityController.createSpeciality);
router.get("/", specialityController.getAllSpecialities);
router.delete("/:id", specialityController.deleteSpeciality);
router.put("/:id", specialityController.updateSpeciality);

export const specialityRouter = router;
