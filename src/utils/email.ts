import { SendEmailOptions } from "./../interfaces/interface";
import nodemailer from "nodemailer";
import { envVar } from "../config/env";
import AppError from "../ErrorHelpers/AppError";
import status from "http-status";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
  host: envVar.EMAIL_SENDER_SMTP_HOST,
  port: Number(envVar.EMAIL_SENDER_SMTP_PORT),
  secure: true,
  auth: {
    user: envVar.EMAIL_SENDER_SMTP_USER,
    pass: envVar.EMAIL_SENDER_SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVar.EMAIL_SENDER_SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.fileName,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log(error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send Email!");
  }
};
