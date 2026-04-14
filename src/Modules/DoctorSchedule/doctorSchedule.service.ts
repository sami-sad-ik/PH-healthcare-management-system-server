import { DoctorSchedule, Prisma } from "../../generated/prisma/client";
import { IRequestUser } from "../../interfaces/interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constant";
import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interface";

const createDoctorSchedule = async (
  user: IRequestUser,
  payload: ICreateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));
  const result = await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
  });
  return result;
};

const getMyDoctorSchedule = async (user: IRequestUser, query: IQueryParams) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    Prisma.DoctorScheduleWhereInput,
    Prisma.DoctorScheduleInclude
  >(
    prisma.doctorSchedule,
    { doctorId: doctorData.id, ...query },
    {
      searchableFields: doctorScheduleSearchableFields,
      filterableFields: doctorScheduleSearchableFields,
    },
  );
  const result = await queryBuilder
    .search()
    .filter()
    .pagination()
    .sort()
    .include({
      doctor: {
        include: {
          user: true,
        },
      },
    })
    .sort()
    .fields()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .execute();
  return result;
};

const getAllDoctorSchedule = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    Prisma.DoctorScheduleWhereInput,
    Prisma.DoctorScheduleInclude
  >(prisma.doctorSchedule, query, {
    searchableFields: doctorScheduleSearchableFields,
    filterableFields: doctorScheduleSearchableFields,
  });
  const result = await queryBuilder
    .search()
    .filter()
    .pagination()
    .sort()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .execute();
  return result;
};

const getDoctorScheduleById = async (id: string) => {
  const result = await prisma.doctorSchedule.findUnique({
    where: { id },
    include: {
      schedule: true,
      doctor: true,
    },
  });
  return result;
};

const updateDoctorSchedule = async (
  user: IRequestUser,
  payload: IUpdateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);
  const updateIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);
  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedule.deleteMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });
    const doctorScheduleData = updateIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));
    const result = await tx.doctorSchedule.createMany({
      data: doctorScheduleData,
    });
    return result;
  });
  return result;
};

const deleteDoctorSchedule = async (id: string, user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const result = await prisma.doctorSchedule.deleteMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: id,
    },
  });
  return result;
};

export const doctorScheduleService = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
