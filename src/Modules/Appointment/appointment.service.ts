import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus } from "../../generated/prisma/enums";

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

  const schedule = await prisma.schedule.findUniqueOrThrow({
    where: { id: payload.scheduleId },
  });
  const doctorSchedule = await prisma.doctorSchedule.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: schedule.id,
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

const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: { userId: user.id },
  });
  const doctorData = await prisma.doctor.findUnique({
    where: { userId: user.id },
  });
  let appointments = [];

  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: { patientId: patientData.id },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorData.id },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("No appointments found for this user");
  }
  return appointments;
};

const getSingleAppointment = async (
  appointmentId: string,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { userId: user.id },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { userId: user.id },
  });
  let appointment;
  if (patientData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("No appointment found for this user");
  }
  return appointment;
};

const getAllAppointments = async () => {};

const changeAppointmentStatus = async () =>
  // appointmentId: string,
  // appointmentStatus: AppointmentStatus,
  // user: IRequestUser,
  {};

export const appointmentService = {
  bookAppointment,
  getMyAppointments,
  getSingleAppointment,
  getAllAppointments,
  changeAppointmentStatus,
};
