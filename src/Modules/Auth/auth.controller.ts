import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import AppError from "../../ErrorHelpers/AppError";
import { RequestHandler } from "express";
import { cookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token!);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Patient created successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = req.user;
  console.log("user from getMe controller", user);
  const result = await authService.getMe(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(status.BAD_REQUEST, "Refresh token is missing!");
  }
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.getNewToken(refreshToken, sessionToken);
  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, newSessionToken);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New tokens generated successfully",
    data: result,
  });
});

const changePassword: RequestHandler = catchAsync(async (req, res) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const payload = req.body;
  const result = await authService.changePassword(sessionToken, payload);
  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req, res) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.logoutUser(sessionToken);

  cookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax",
  });
  cookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax",
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
    data: result,
  });
});

const verifyEmail: RequestHandler = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reset password otp sent successfully",
  });
});

const resetPassword: RequestHandler = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

const googleLogin = catchAsync(async (req, res) => {});

const googleLoginSuccess = catchAsync(async (req, res) => {});

const handleOAuthError = catchAsync(async (req, res) => {});

export const authController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};
