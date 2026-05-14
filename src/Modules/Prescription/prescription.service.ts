import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescription } from "./prescription.interface";

const givePrescription = async (
  payload: ICreatePrescription,
  user: IRequestUser,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
  });
  if (appointmentData.doctorId !== doctorData.id) {
    throw new Error("You can only give prescription for your own appointments");
  }
  const isPrescribed = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });
  if (isPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "Prescription already given for this appointment",
    );
  }
  const followUpDate = new Date(payload.followUpDate);
  const result = await prisma.prescription.create({
    data: {
      ...payload,
      followUpDate,
      doctorId: doctorData.id,
      patientId: appointmentData.patientId,
    },
  });
  return result;
};

const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });
  return result;
};

const myPrescriptions = async () => {};

const updatePrescription = async () => {};

const deletePrescription = async () => {};

export const prescriptionService = {
  givePrescription,
  getAllPrescriptions,
  myPrescriptions,
  updatePrescription,
  deletePrescription,
};
