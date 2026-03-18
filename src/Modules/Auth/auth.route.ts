import { Router } from "express";
import { authController } from "./auth.controller";
import checkAuth from "../../Middleware/checkAuth";

const router = Router();

router.post("/sign-up/email", authController.registerPatient);
router.post("/sign-in/email", authController.loginUser);
router.get("/me", checkAuth(), authController.getMe);
router.post("/refresh-token", authController.getNewToken);
router.post("/change-password", checkAuth(), authController.changePassword);
router.post("/logout", checkAuth(), authController.logoutUser);

export const authRoute = router;
