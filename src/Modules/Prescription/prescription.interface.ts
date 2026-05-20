export interface ICreatePrescription {
  appointmentId: string;
  followUpDate: Date;
  instructions: string;
}

export interface IUpdatePrescription {
  followUpDate?: Date;
  instructions?: string;
}
