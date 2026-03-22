import { Role, UserStatus } from "../generated/prisma/enums";

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

export interface Session {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: Role;
    status: UserStatus;
    needPasswordChange: boolean;
    isDeleted: boolean;
    deletedAt?: Date | null | undefined;
  };
}
