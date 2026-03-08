import { NextFunction, Request, Response } from "express";
import { envVar } from "../config/env";
import status from "http-status";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVar.NODE_ENV === "development") {
    console.error("Error from global error handler :", err);
  }
  let statusCode = status.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: err.message,
  });
};
