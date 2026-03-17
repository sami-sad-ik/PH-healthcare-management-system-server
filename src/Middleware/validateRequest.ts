import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateRequest=(zodSchema : ZodType)=>  (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;
  const parsedData = zodSchema.safeParse(data);
  if (!parsedData.success) {
    return next(parsedData.error);
  }

  req.body = parsedData.data;

  next();
};
