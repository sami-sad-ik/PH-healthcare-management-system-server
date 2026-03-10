import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../Middleware/validateRequest";

const router = Router();

router.post("/create-doctor", validateRequest, userController.createDoctor);

export const userRoute = router;
