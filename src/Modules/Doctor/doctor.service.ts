import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAuthUser, IUpdateDoctor } from "./doctor.interface";
import { Role } from "../../generated/prisma/enums";

const getAllDoctors = async () => {
  const result = await prisma.doctor.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      address: true,
      registrationNumber: true,
      gender: true,
      qualification: true,
      experience: true,
      appointmentFee: true,
      currentWorkingPlace: true,
      designation: true,
      averageRating: true,
      specialities: {
        select: {
          speciality: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  const doctors = result.map((doctor) => ({
    ...doctor,
    specialities: doctor.specialities.map((s) => s.speciality),
  }));

  return doctors;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
    include: {
      specialities: {
        select: { speciality: true },
      },
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

/**
 * model DoctorSpeciality {
    id String @id @default(uuid(7))

    specialityId String
    doctorId String 
    speciality Speciality @relation(fields : [specialityId] ,references : [id], onDelete  : Cascade , onUpdate : Cascade)
    doctor Doctor @relation(fields : [doctorId] ,references : [id], onDelete  : Cascade , onUpdate : Cascade)


    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
 */

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
  const result =  await prisma.$transaction(async (tx) => {
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
      include: { specialities: { select: { speciality: true } } },
    });


  });

  return {
    ...result,
    specialities: result?.specialities.map(s=>s.speciality) || []
  }
};

export const doctorService = { getAllDoctors, getDoctorById, deleteDoctor ,updateDoctor };
