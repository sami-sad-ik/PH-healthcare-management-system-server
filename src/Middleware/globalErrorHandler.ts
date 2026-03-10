import { NextFunction, Request, Response } from "express";
import { envVar } from "../config/env";
import status from "http-status";
import z, { unknown } from "zod";
import { TerrResponse, TerrSources } from "../interfaces";
import { zodErrorHandler } from "../ErrorHelpers/zodErrorHandler";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVar.NODE_ENV === "development") {
    console.error("Error from global error handler :", err);
  }
  let errSources: TerrSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (err instanceof z.ZodError) {
    const simplifiedError = zodErrorHandler(err);
      statusCode = simplifiedError.statusCode,
      message = simplifiedError.message;
      errSources = [...simplifiedError.errSources];
  }
  // from ai
  // else if (err instanceof Error) {
  //   message = err.message;
  //   errSources = [
  //     {
  //       path: "unknown",
  //       message: err.message,
  //     },
  //   ];
  // }

  const errorResponse: TerrResponse = {
    success: false,
    message ,
    errSources,
    error: envVar.NODE_ENV === "development" ? err.message : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
