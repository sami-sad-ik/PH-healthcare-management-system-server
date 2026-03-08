import { Router } from "express";
import { specialityRouter } from "../Modules/Speciality/speciality.route";
import { authRouter } from "../Modules/Auth/auth.route";
import { userRouter } from "../Modules/User/user.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/speciality", specialityRouter);
router.use("/user", userRouter);

export const indexRoutes = router;
