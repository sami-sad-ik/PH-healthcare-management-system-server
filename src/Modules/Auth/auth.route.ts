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
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/google/login", authController.googleLogin);
router.get("/google/success", authController.googleLoginSuccess);
router.get("/OAuth/error", authController.handleOAuthError);

export const authRoute = router;
