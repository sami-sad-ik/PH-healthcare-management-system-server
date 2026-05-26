import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { PaymentStatus, Role } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;
  switch (user.role) {
    case Role.SUPER_ADMIN:
      statsData = await getSuperAdminStatsData();
      break;
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.DOCTOR:
      statsData = await getDoctorStatsData();
      break;
    case Role.PATIENT:
      statsData = await getPatientStatsData();
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};

const getSuperAdminStatsData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const superAdminCount = await prisma.user.count({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();
  const userCount = await prisma.user.count();
  const totalRevenue = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
    },
    _sum: {
      amount: true,
    },
  });
  return {
    appointmentCount,
    doctorCount,
    patientCount,
    superAdminCount,
    adminCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getAdminStatsData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const adminCount = await prisma.admin.count();
  const userCount = await prisma.user.count();
  const totalRevenue = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.PAID,
    },
    _sum: {
      amount: true,
    },
  });
  return {
    appointmentCount,
    doctorCount,
    patientCount,
    adminCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

const getDoctorStatsData = async (user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUnique({
    where: {
      userId: user.id,
    },
  });
  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData?.id,
    },
  });
  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData?.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: {
      doctorId: doctorData?.id,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    where: {
      appointment: {
        doctorId: doctorData?.id,
      },
      status: PaymentStatus.PAID,
    },
    _sum: {
      amount: true,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      doctorId: doctorData?.id,
    },
    _count: {
      id: true,
    },
  });
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: _count.id,
    }));

  return {
    reviewCount,
    appointmentCount,
    patientCount: patientCount.length,
    totalRevenue: totalRevenue._sum.amount || 0,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getPatientStatsData = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      userId: user.id,
    },
  });
  return patientData;
};

export const statsService = {
  getDashboardStatsData,
};
