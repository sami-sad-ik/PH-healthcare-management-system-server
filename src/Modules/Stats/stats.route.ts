import { Router } from "express";

const router = Router();

router.get("/", statsController.getDashboardStatsData);

export const statsRoute = router;
