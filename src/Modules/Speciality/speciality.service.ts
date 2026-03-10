import { Speciality } from "./../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../ErrorHelpers/AppError";
import status from "http-status";

const createSpeciality = async (payload: Speciality) => {
  const specialityExists = await prisma.speciality.findFirst({
    where: { title: { equals: payload.title, mode: "insensitive" } },
  });

  if(specialityExists) throw new AppError(status.CONFLICT,`Speciality ${payload.title} already exists!`)
  const speciality = await prisma.speciality.create({
    data: payload,
  });

  return speciality;
};

const getAllSpecialities = async () => {
  const specialities = await prisma.speciality.findMany();
  return specialities;
};

const deleteSpeciality = async (id: string) => {
  const result = await prisma.speciality.delete({
    where: { id },
  });
  return result;
};

const updateSpeciality = async (id: string, payload: Speciality) => {
  const result = await prisma.speciality.update({
    where: { id },
    data: payload,
  });
  return result;
};

export const specialityService = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
  updateSpeciality,
};
