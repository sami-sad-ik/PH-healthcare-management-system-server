import { Router } from "express";
import { specialityRoute } from "../Modules/Speciality/speciality.route";
import { authRoute } from "../Modules/Auth/auth.route";
import { userRoute } from "../Modules/User/user.route";
import { doctorRoute } from "../Modules/Doctor/doctor.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/speciality", specialityRoute);
router.use("/user", userRoute);
router.use("/doctor", doctorRoute);

export const indexRoutes = router;
