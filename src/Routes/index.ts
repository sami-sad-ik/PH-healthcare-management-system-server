import { Router } from "express";
import { specialityRoute } from "../Modules/Speciality/speciality.route";
import { authRoute } from "../Modules/Auth/auth.route";
import { userRoute } from "../Modules/User/user.route";
import { doctorRoute } from "../Modules/Doctor/doctor.route";
import { adminRoute } from "../Modules/Admin/admin.route";
import { scheduleRoute } from "../Modules/Schedule/schedule.route";
import { doctorScheduleRoute } from "../Modules/DoctorSchedule/doctorSchedule.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/speciality", specialityRoute);
router.use("/user", userRoute);
router.use("/doctor", doctorRoute);
router.use("/admin", adminRoute);
router.use("/schedule", scheduleRoute);
router.use("/doctor-schedule", doctorScheduleRoute);

export const indexRoutes = router;
