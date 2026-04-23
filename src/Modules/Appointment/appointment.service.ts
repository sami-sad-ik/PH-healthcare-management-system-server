import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus } from "../../generated/prisma/enums";
import { stripe } from "../../config/stripe.config";
import { envVar } from "../../config/env";

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
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 120,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVar.FRONTEND_URL}/dashboard/payment/payment-success`,
      cancel_url: `${envVar.FRONTEND_URL}/dashboard/payment`,
    });

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
