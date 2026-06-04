import { Router } from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../Middleware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.get(
  "/",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminController.getAllAdmins,
);
router.get(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminController.getAdminById,
);
router.delete(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminController.deleteAdmin,
);
router.patch(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  validateRequest(updateAdminZodSchema),
  adminController.updateAdmin,
);
router.patch(
  "/change-user-status",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  adminController.changeUserStatus,
);
router.patch(
  "/change-user-role",
  checkAuth(Role.SUPER_ADMIN),
  adminController.changeUserRole,
);

export const adminRoute = router;
