import { NextFunction, Request, Response } from "express";
import { envVar } from "../config/env";
import status from "http-status";
import z from "zod";
import { TerrResponse, TerrSources } from "../interfaces";
import { zodErrorHandler } from "../ErrorHelpers/zodErrorHandler";
import AppError from "../ErrorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVar.NODE_ENV === "development") {
    console.error("Error from global error handler :", err);
  }

  if (req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }

  let errSources: TerrSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;

  if (err instanceof z.ZodError) {
    const simplifiedError = zodErrorHandler(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errSources = [...simplifiedError.errSources];
    stack = err.stack;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
  }

  const errorResponse: TerrResponse = {
    success: false,
    message,
    errSources,
    stack: envVar.NODE_ENV === "development" ? stack : undefined,
    error: envVar.NODE_ENV === "development" ? err.message : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
