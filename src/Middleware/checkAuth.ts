import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../ErrorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVar } from "../config/env";
import { JwtPayload } from "jsonwebtoken";



const checkAuth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );
      if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
      }
      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: { user: true },
        });
        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const createdAt = new Date(sessionExists.createdAt);
          const expiresAt = new Date(sessionExists.expiresAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const sessionRemainingTime = expiresAt.getTime() - now.getTime();
          const percentageRenaining =
            (sessionRemainingTime / sessionLifeTime) * 100;
          if (percentageRenaining < 20) {
            res.setHeader("X-Session-Expiring-Soon", "true");
            res.setHeader("X-Session-expires-at", expiresAt.toISOString());
            res.setHeader(
              "X-Session-remaining-time",
              sessionRemainingTime.toString(),
            );
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
          }
          if (roles.length && !roles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Forbidden access ! you don't have permission to access for this resource",
            );
          }

          req.user = {
            id : user.id,
            email : user.email,
            role : user.role,
          }
        }
      }
      
      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
      }
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVar.ACCESS_TOKEN_SECRET,
      ) as JwtPayload;
      if (!verifiedToken.success) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
      }
      if (roles.length && !roles.includes(verifiedToken.data.role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access ! you don't have permission to access for this resource",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAuth;
