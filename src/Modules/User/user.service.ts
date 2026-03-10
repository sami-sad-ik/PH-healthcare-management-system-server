import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { Role, Speciality } from "../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IDoctorPayload } from "./user.interface";

const createDoctor = async (payload: IDoctorPayload) => {
  const specialities: Speciality[] = [];

  for (const specialityId of payload.specialities) {
    const speciality = await prisma.speciality.findUnique({
      where: { id: specialityId },
    });
    if (!speciality)
      throw new AppError(
        status.BAD_REQUEST,
        `Speciality with id ${specialityId} not found!`,
      );
    specialities.push(speciality);
  }

  const existsUser = await prisma.user.findUnique({
    where: { email: payload.doctor.email },
  });
  if (existsUser) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User already exists with this email!",
    );
  }

  const userData = await auth.api.signUpEmail({
    body: {
      name: payload.doctor.name,
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });
      const doctorSpecialityData = specialities.map((speciality) => {
        return {
          doctorId: doctorData.id,
          specialityId: speciality.id,
        };
      });
      await tx.doctorSpeciality.createMany({ data: doctorSpecialityData });

      const doctor = await tx.doctor.findUnique({
        where: { id: doctorData.id },
        select: {
          id: true,
          userId: true,
          email: true,
          name: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          experience: true,
          qualification: true,
          appointmentFee: true,
          registrationNumber: true,
          gender: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              image: true,
              isDeleted: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          specialities: {
            select: {
              speciality: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
      return doctor;
    });
    return result;
  } catch (error) {
    console.log(error);
    await prisma.user.delete({ where: { id: userData.user.id } });
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to create Doctor , registration rolled back.",
    );
  }
};

export const userService = { createDoctor };
