import { Router } from "express";
import { specialityRoute } from "../Modules/Speciality/speciality.route";
import { authRoute } from "../Modules/Auth/auth.route";
import { userRoute } from "../Modules/User/user.route";
import { doctorRoute } from "../Modules/Doctor/doctor.route";
import { adminRoute } from "../Modules/Admin/admin.route";
import { scheduleRoute } from "../Modules/Schedule/schedule.route";
import { doctorScheduleRoute } from "../Modules/DoctorSchedule/doctorSchedule.route";
import { appointmentRoute } from "../Modules/Appointment/appointment.route";
import { patientRoute } from "../Modules/Patient/patient.route";
import { ReviewRoute } from "../Modules/Review/review.route";
import { paymentRoute } from "../Modules/Payment/payment.route";
import { statsRoute } from "../Modules/Stats/stats.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/speciality", specialityRoute);
router.use("/user", userRoute);
router.use("/doctor", doctorRoute);
router.use("/admin", adminRoute);
router.use("/schedule", scheduleRoute);
router.use("/doctor-schedule", doctorScheduleRoute);
router.use("/appointment", appointmentRoute);
router.use("/patients", patientRoute);
router.use("/review", ReviewRoute);
router.use("/payment", paymentRoute);
router.use("/stats", statsRoute);

export const indexRoutes = router;
