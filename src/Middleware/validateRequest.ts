import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateRequest =
  (zodSchema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parsedData = zodSchema.safeParse(req.body);
    if (!parsedData.success) {
      return next(parsedData.error);
    }

    req.body = parsedData.data;

    next();
  };
