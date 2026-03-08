import { speciality } from "./../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: speciality) => {
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

const updateSpeciality = async (id: string, payload: speciality) => {
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
