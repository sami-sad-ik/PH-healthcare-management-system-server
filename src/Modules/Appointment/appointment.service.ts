import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      userId: user.id,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });
  const doctorSchedule = await prisma.doctorSchedule.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
      },
    },
  });
  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: doctorData.id,
        patientId: patientData.id,
        scheduleId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    //todo : payment integration will be here
    return appointmentData;
  });
  return result;
};

const getMyAppointments = async () => {};

const getSingleAppointment = async () => {};

const getAllAppointments = async () => {};

const changeAppointmentStatus = async () => {};

export const appointmentService = {
  bookAppointment,
  getMyAppointments,
  getSingleAppointment,
  getAllAppointments,
  changeAppointmentStatus,
};
