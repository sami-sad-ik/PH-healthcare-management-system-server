import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import AppError from "../../ErrorHelpers/AppError";
import { RequestHandler } from "express";
import { cookieUtils } from "../../utils/cookie";
import { envVar } from "../../config/env";
import { auth } from "../../lib/auth";
import { Session } from "../../interfaces/interface";

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

//? /api/v1/auth/login/google?redirect=/profile
const googleLogin: RequestHandler = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);
  const callbackURL = `${envVar.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.render("googleRedirect", {
    callbackURL,
    betterAuthURL: envVar.BETTER_AUTH_URL,
  });
});

const googleLoginSuccess: RequestHandler = catchAsync(async (req, res) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.render(`${envVar.FRONTEND_URL}/login?error=OAuth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });
  if (session && !session.user) {
    return res.render(`${envVar.FRONTEND_URL}/login?error=no_user_found`);
  }

  const result = await authService.googleLoginSuccess(session as Session);
  const { accessToken, refreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVar.FRONTEND_URL}${finalRedirectPath}`);
});

const handleOAuthError: RequestHandler = catchAsync(async (req, res) => {
  const error = (req.query.error as string) || "OAuth_error";
  res.redirect(`${envVar.FRONTEND_URL}/login?error=${error}`);
});

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
