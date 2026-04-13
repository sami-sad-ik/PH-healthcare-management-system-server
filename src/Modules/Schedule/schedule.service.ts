import { addHours, addMinutes, format } from "date-fns";
import { ICreateSchedule } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, Schedule } from "../../generated/prisma/client";

const createSchedule = async (payload: ICreateSchedule) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const interval = 30;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const schedules = [];
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]),
        ),
        Number(startTime.split(":")[1]),
      ),
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]),
        ),
        Number(endTime.split(":")[1]),
      ),
    );
    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, interval));
      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      startDateTime.setMinutes(startDateTime.getMinutes() + interval);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

const getAllSchedules = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {});
};

const getScheduleById = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
  });
  return schedule;
};

const updateSchedule = async () => {};

const deleteSchedule = async () => {};

export const scheduleService = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
