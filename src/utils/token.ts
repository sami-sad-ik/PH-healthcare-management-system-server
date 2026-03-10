import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVar } from "../config/env";
import { Response } from "express";
import ms, { StringValue } from "ms";
import { cookieUtils } from "./cookie";

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVar.ACCESS_TOKEN_SECRET,
    { expiresIn: envVar.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVar.REFRESH_TOKEN_SECRET,
    { expiresIn: envVar.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return refreshToken;
};

const setAccessTokenCookie = (res: Response, token: string) => {
  const maxAge = 60 * 60 * 60 * 24;
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: Number(maxAge),
  });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  const maxAge = 60 * 60 * 60 * 24 * 7;
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: Number(maxAge),
  });
};

const setBetterAuthSessionCookie = (res: Response, token: string) => {
  const maxAge = 60 * 60 * 60 * 24;
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: maxAge,
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
