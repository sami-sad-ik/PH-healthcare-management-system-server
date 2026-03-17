import { Gender } from "../../generated/prisma/enums";

export interface IDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
    profilePhoto: string;
    contactNumber: string;
    address: string;
    registrationNumber: string;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    experience: number;
    currentWorkingPlace: string;
    designation: string;
  };
  specialities: string[];
}

export interface ICreateAdmin {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}
