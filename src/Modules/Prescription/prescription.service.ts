import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescription } from "./prescription.interface";
import { Role } from "../../generated/prisma/enums";
import { generatePrescriptionPDF } from "./prescription.utils";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";

const givePrescription = async (
  payload: ICreatePrescription,
  user: IRequestUser,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
    include: {
      patient: true,
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
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

  await prisma.$transaction(async (tx) => {
    const result = await tx.prescription.create({
      data: {
        ...payload,
        followUpDate,
        doctorId: doctorData.id,
        patientId: appointmentData.patientId,
      },
    });
    const pdfBuffer = (await generatePrescriptionPDF({
      doctorName: doctorData.name,
      doctorEmail: doctorData.email,
      patientName: appointmentData.patient.name,
      patientEmail: appointmentData.patient.email,
      appointmentDate: appointmentData.schedule.startDateTime,
      instructions: payload.instructions,
      followUpDate,
      prescriptionId: result.id,
      createdAt: new Date(),
    })) as Buffer;
    const fileName = `Prescription-${new Date()}.pdf`;
    const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
    const pdfUrl = uploadedFile.secure_url;
    await tx.prescription.update({
      where: {
        id: result.id,
      },
      data: {
        pdfUrl,
      },
    });
    return result;
  });
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

const myPrescriptions = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (user.role === Role.PATIENT) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: user.id,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }
  if (user.role === Role.DOCTOR) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: user.id,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }
};

const updatePrescription = async () => {};

const deletePrescription = async () => {};

export const prescriptionService = {
  givePrescription,
  getAllPrescriptions,
  myPrescriptions,
  updatePrescription,
  deletePrescription,
};
