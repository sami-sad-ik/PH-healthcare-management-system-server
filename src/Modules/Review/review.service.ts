import status from "http-status";
import AppError from "../../ErrorHelpers/AppError";
import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { IcreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

const giveReview = async (
  payload: IcreateReviewPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });
  if (appointmentData.paymentStatus !== "PAID") {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review after payment is done",
    );
  }
  if (appointmentData.patientId !== patientData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review for your own appointments",
    );
  }
  const isReviewed = await prisma.review.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isReviewed) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed for this appointment, you can update the review if you want to change it",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: patientData.id,
        doctorId: appointmentData.doctorId,
      },
    });
    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });
    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return review;
  });
  return result;
};

const getReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      patient: true,
      doctor: true,
    },
  });
  return reviews;
};

const getMyReviews = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  if (isUserExists.role === "PATIENT") {
    const patientData = await prisma.patient.findUniqueOrThrow({
      where: { email: isUserExists.email },
    });
    return await prisma.review.findMany({
      where: { patientId: patientData.id },
    });
  }
  if (isUserExists.role === "DOCTOR") {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: { email: isUserExists.email },
    });
    return await prisma.review.findMany({
      where: { doctorId: doctorData.id },
    });
  }
};

const updateReview = async (
  reviewId: string,
  payload: IUpdateReviewPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
  });

  if (reviewData.patientId !== user.id) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You can only update your own reviews",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({
      where: {
        id: reviewId,
      },
      data: { ...payload },
    });
    const averageRating = await prisma.review.aggregate({
      where: {
        doctorId: reviewData.doctorId,
      },
      _avg: { rating: true },
    });
    await prisma.doctor.update({
      where: { id: reviewData.doctorId },
      data: { averageRating: averageRating._avg.rating as number },
    });
  });
};

const deleteReview = async () => {};

export const ReviewService = {
  giveReview,
  getReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
