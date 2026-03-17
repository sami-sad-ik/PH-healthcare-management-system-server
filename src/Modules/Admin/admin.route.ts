import { Router } from "express";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../Middleware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";
import checkAuth from "../../Middleware/checkAuth";

const router = Router();

router.get("/",checkAuth("ADMIN","SUPER_ADMIN"), adminController.getAllAdmins);
router.get("/:id",checkAuth("ADMIN","SUPER_ADMIN"), adminController.getAdminById);
router.delete("/:id", checkAuth("ADMIN","SUPER_ADMIN"), adminController.deleteAdmin);
router.patch(
  "/:id",
  checkAuth("ADMIN" ,"SUPER_ADMIN"),
  validateRequest(updateAdminZodSchema),
  adminController.updateAdmin,
);

export const adminRoute = router;
