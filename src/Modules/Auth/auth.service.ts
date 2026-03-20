import { notFound } from "./../../Middleware/notFound";
import { UserStatus } from "../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../ErrorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/interface";
import { jwtUtils } from "../../utils/jwt";
import { envVar } from "../../config/env";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegisterPatientPayload,
} from "./auth.interface";
import { JwtPayload } from "jsonwebtoken";

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const isExistingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (isExistingUser) {
    throw new AppError(status.BAD_REQUEST, "User already exists");
  }

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to register patient",
    );
  }
  // creating patient when registering
  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });
      return patientTx;
    });

    const accessToken = tokenUtils.getAccessToken({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return { ...data, patient, accessToken, refreshToken };
  } catch (error) {
    console.log("Transaction error! :", error);
    // Rollback user creation in Better Auth
    await prisma.user.delete({
      where: { id: data.user.id },
    });
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to create patient profile, registration rolled back.",
    );
  }
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && !existingUser.emailVerified) {
    await auth.api.sendVerificationOTP({
      body: { email, type: "email-verification" },
    });
    throw new AppError(
      status.FORBIDDEN,
      "Email not verified. A new OTP has been sent to your email.",
    );
  }

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked!");
  }

  if (data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted!");
  }

  const accessToken = tokenUtils.getAccessToken({
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return { ...data, accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patient: {
        include: {
          patientHealthData: true,
          appointments: true,
          medicalReports: true,
          prescriptions: true,
          reviews: true,
        },
      },
      doctor: {
        include: {
          specialities: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return isUserExists;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });
  if (!isSessionExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVar.REFRESH_TOKEN_SECRET,
  );
  if (!verifiedRefreshToken.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtils.getAccessToken({
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const betterAuthSessionToken = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: betterAuthSessionToken.token,
  };
};

const changePassword = async (
  sessionToken: string,
  payload: IChangePasswordPayload,
) => {
  const session = await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
  }

  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false },
    });
  }

  const accessToken = tokenUtils.getAccessToken({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  });

  return { ...result, accessToken, refreshToken };
};

const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  if (user.isDeleted || user.status === "DELETED") {
    throw new AppError(status.FORBIDDEN, "User has been deleted!");
  }
  if (!user.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Your email is not verified");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: { email },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  if (user.isDeleted || user.status === "DELETED") {
    throw new AppError(status.FORBIDDEN, "User has been deleted!");
  }
  if (!user.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Your email is not verified");
  }
  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (user.needPasswordChange) {
    await prisma.user.update({
      where: { email },
      data: { needPasswordChange: false },
    });
  }

  if (result.success) {
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }
};

const googleLoginSuccess = async () => {};

export const authService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLoginSuccess,
};
