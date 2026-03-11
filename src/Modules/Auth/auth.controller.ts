import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.registerPatient(payload, req, res);
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
  const result = await authService.loginUser(payload, req, res);
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

export const authController = { registerPatient, loginUser };
