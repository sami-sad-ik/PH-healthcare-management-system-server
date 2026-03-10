import status from "http-status";
import z from "zod";
import { TerrSources } from "../interfaces";

export const zodErrorHandler = (err: z.ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const message = "Zod validation error";

  const errSources: TerrSources[] = [];

  err.issues.forEach((issue) => {
    errSources.push({
      path: issue.path.join(".") || "unknown",
      message: issue.message,
    });
  });

  return {
    success: false,
    statusCode,
    message,
    errSources,
  };
};
