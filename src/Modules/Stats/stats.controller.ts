import { RequestHandler } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getDashboardStatsData: RequestHandler = catchAsync(
  async (req, res, next) => {
    const user = req.user;
    const result = await statsService.getDashboardStatsData(user);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: result,
    });
  },
);

export const statsController = {
  getDashboardStatsData,
};
