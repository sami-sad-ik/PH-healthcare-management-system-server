import { Role } from "../generated/prisma/enums";

export interface IRequestUser {
  id: string;
  role: Role;
  email: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    fileName: string;
    content: Buffer | string;
    contentType: string;
  }[];
}
