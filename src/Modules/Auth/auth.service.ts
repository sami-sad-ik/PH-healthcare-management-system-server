import { Request, Response } from "express";
import { UserStatus } from "../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

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
    throw new Error("User already exists");
  }

  const response = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
    headers: req.headers as Record<string, string>,
    asResponse: true,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }
  const data = await response.json();



  if (!data.user) throw new Error("Failed to register patient");
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

    return { ...data, patient };
  } catch (error) {
    console.log("Transaction error! :", error);
    await auth.api.deleteUser(data.user.id); // Rollback user creation in Better Auth
    throw new Error(
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
  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    headers : req.headers as Record<string,string>,
    asResponse :true
  });
    const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }

  const data = await response.json();

  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("User is blocked!");
  }

  if (data.user.status === UserStatus.DELETED) {
    throw new Error("User is deleted!");
  }

  return data;
};

export const authService = { registerPatient, loginUser };
