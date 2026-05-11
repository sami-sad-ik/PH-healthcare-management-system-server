export interface IcreateReviewPayload {
  appointmentId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  reviewId: string;
  rating?: number;
  comment?: string;
}
