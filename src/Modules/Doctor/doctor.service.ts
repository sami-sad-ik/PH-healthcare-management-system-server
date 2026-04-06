import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctor } from "./doctor.interface";
import { Role } from "../../generated/prisma/enums";
import { IAuthUser } from "../Auth/auth.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import {
  doctorFilterableFields,
  doctorSearchableFields,
} from "./doctor.constant";
import { Doctor, Prisma } from "../../generated/prisma/client";

const getAllDoctors = async (query: IQueryParams) => {
  // const result = await prisma.doctor.findMany({
  //   where: { isDeleted: false },
  //   orderBy: { createdAt: "desc" },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     profilePhoto: true,
  //     contactNumber: true,
  //     address: true,
  //     registrationNumber: true,
  //     gender: true,
  //     qualification: true,
  //     experience: true,
  //     appointmentFee: true,
  //     currentWorkingPlace: true,
  //     designation: true,
  //     averageRating: true,
  //     specialities: {
  //       select: {
  //         speciality: {
  //           select: { id: true, title: true },
  //         },
  //       },
  //     },
  //   },
  // });
  // const doctors = result.map((doctor) => ({
  //   ...doctor,
  //   specialities: doctor.specialities.map((s) => s.speciality),
  // }));
  // return doctors;

  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder.search().filter().where({});
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
      specialities: {
        select: { speciality: true },
      },
      appointments: { orderBy: { createdAt: "desc" } },
      doctorSchedules: true,
      reviews: true,
    },
  });
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  return {
    ...doctor,
    specialities: doctor.specialities.map((s) => s.speciality),
  };
};

const deleteDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  if (doctor.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Doctor already deleted");
  }
  await prisma.doctor.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
};

const updateDoctor = async (
  id: string,
  payload: IUpdateDoctor,
  currentUser: IAuthUser,
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  if (currentUser.role === Role.DOCTOR && currentUser.email !== doctor.email) {
    throw new AppError(status.FORBIDDEN, "You can only update your profile!");
  }
  const { specialities, ...updateBody } = payload;
  const result = await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: updateBody,
    });
    if (specialities?.length) {
      await tx.doctorSpeciality.deleteMany({ where: { doctorId: id } });
      await tx.doctorSpeciality.createMany({
        data: specialities.map((speciality) => ({
          doctorId: id,
          specialityId: speciality,
        })),
      });
    }
    return await tx.doctor.findUnique({
      where: { id },
      include: { specialities: { include: { speciality: true } } },
    });
  });

  return {
    ...result,
    specialities: result?.specialities.map((s) => s.speciality) || [],
  };
};

export const doctorService = {
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  updateDoctor,
};
