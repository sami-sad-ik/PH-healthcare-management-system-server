import { Request, Response } from "express";
import { UserStatus } from "../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../ErrorHelpers/AppError";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerPatient = async (
  payload: IRegisterPatientPayload,
  req: Request,
  res: Response,
) => {
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
    // headers: req.headers as Record<string, string>,
    // asResponse: true,
  });

  // const setCookie = response.headers.get("set-cookie");
  // if (setCookie) {
  //   res.setHeader("set-cookie", setCookie);
  // }
  // const data = await response.json();

  if (!data.user) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to register patient",
    );
  }
  //  TODO : patient table create after creating patient schema
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
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

    return { ...data, patient ,accessToken ,refreshToken };
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

const loginUser = async (
  payload: ILoginUserPayload,
  req: Request,
  res: Response,
) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    // headers: req.headers as Record<string, string>,
    // asResponse: true,
  });
  // const setCookie = response.headers.get("set-cookie");
  // if (setCookie) {
  //   res.setHeader("set-cookie", setCookie);
  // }
  // const data = await response.json();

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked!");
  }

  if (data.user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted!");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });
  
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  });

  return { ...data, accessToken, refreshToken };
};

export const authService = { registerPatient, loginUser };
