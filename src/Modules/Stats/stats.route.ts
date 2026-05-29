import { Router } from "express";
import { statsController } from "./stats.controller";
import checkAuth from "../../Middleware/checkAuth";

const router = Router();

router.get("/", checkAuth(), statsController.getDashboardStatsData);

export const statsRoute = router;
