import { Router } from "express";
import checkAuth from "../../Middleware/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import { validateRequest } from "../../Middleware/validateRequest";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PATIENT),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.giveReview,
);

router.get("/", ReviewController.getReviews);

router.get(
  "/my-reviews",
  checkAuth(Role.PATIENT, Role.DOCTOR),
  ReviewController.getMyReviews,
);

router.patch(
  "/:reviewId",
  checkAuth(Role.PATIENT),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview,
);

router.delete(
  "/:reviewId",
  checkAuth(Role.PATIENT),
  ReviewController.deleteReview,
);

export const ReviewRoute = router;
