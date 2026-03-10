import { NextFunction, Request, Response } from "express";
import { createDoctorZodSchema } from "../Modules/User/user.validation";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;
  console.log("before :-->", data);
  const parsedData = createDoctorZodSchema.safeParse(data);
  if (!parsedData.success) {
    return next(parsedData.error);
  }

  req.body = parsedData.data;
  console.log("after :-->", req.body);

  next();
};
