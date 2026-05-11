import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const giveReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await ReviewService.giveReview(payload, user);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await ReviewService.getMyReviews(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await ReviewService.getMyReviews(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const payload = req.body;
  const user = req.user;
  const result = await ReviewService.updateReview(
    reviewId as string,
    payload,
    user,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const user = req.user;
  const result = await ReviewService.deleteReview(reviewId as string, user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  giveReview,
  getReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
