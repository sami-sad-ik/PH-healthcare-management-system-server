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
      statsData = await getDoctorStatsData(user);
      break;
    case Role.PATIENT:
      statsData = await getPatientStatsData(user);
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

  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    superAdminCount,
    adminCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    pieChartData,
    barChartData,
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

  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    adminCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    pieChartData,
    barChartData,
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
  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData?.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData?.id,
    },
  });
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      patientId: patientData?.id,
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
    appointmentCount,
    reviewCount,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};
const getPieChartData = async () => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });
  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ status, _count }) => ({
      status,
      count: _count.id,
    }));
  return formattedAppointmentStatusDistribution;
};

const getBarChartData = async () => {
  interface IAppointmentCountByMonth {
    month: Date;
    count: bigint;
  }

  const appointmentCountByMonth: IAppointmentCountByMonth[] =
    await prisma.$queryRaw`
    SELECT Date_TRUNC('month', "createdAt") AS month, 
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC;
  `;

  return appointmentCountByMonth;
};

export const statsService = {
  getDashboardStatsData,
};
