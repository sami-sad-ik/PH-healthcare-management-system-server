import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { generateInvoicePdf } from "./payment.utils";
import { sendEmail } from "../../utils/email";
const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });
  if (existingPayment) {
    console.log(`event ${event.id} already processed. Skipping...`);
    return { message: "Event already processed" };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;
      if (!appointmentId || !paymentId) {
        console.log("appointmentId or paymentId is missing");
        return { message: "appointmentId or paymentId is missing" };
      }
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
          payment: true,
          schedule: true,
        },
      });

      if (!appointment) {
        console.log("Appointment not found");
        return { message: "appointment not found" };
      }

      let pdfBuffer: Buffer | null = null;

      const result = await prisma.$transaction(async (tx) => {
        const updatedAppointment = await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        let invoiceUrl = null;

        if (session.payment_status === "paid") {
          try {
            // Generate invoice PDF
            pdfBuffer = await generateInvoicePdf({
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: appointment.schedule.startDateTime.toString(),
              amount: appointment.payment?.amount || 0,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toISOString(),
            });

            // Upload PDF to Cloudinary
            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`,
            );

            invoiceUrl = cloudinaryResponse?.secure_url;

            console.log(
              `✅ Invoice PDF generated and uploaded for payment ${paymentId}`,
            );
          } catch (pdfError) {
            console.error(
              "❌ Error generating/uploading invoice PDF:",
              pdfError,
            );
            // Continue with payment update even if PDF generation fails
          }
        }

        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
            invoiceUrl,
          },
        });

        return {
          updatedAppointment,
          updatedPayment,
          invoiceUrl,
        };
      });

      if (session.payment_status === "paid" && result.invoiceUrl) {
        try {
          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              patientName: appointment.patient.name,
              invoiceId: appointment.payment?.id || paymentId,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toLocaleDateString(),
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              invoiceUrl: result.invoiceUrl,
            },
            attachments: [
              {
                filename: `Invoice-${paymentId}.pdf`,
                content: pdfBuffer || Buffer.from(""), // Attach PDF if generated, else empty buffer
                contentType: "application/pdf",
              },
            ],
          });

          console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
        } catch (emailError) {
          console.error("❌ Error sending invoice email:", emailError);
          // Log but don't fail the payment if email fails
        }
      }
      console.log(
        `processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(
        `checkout session ${session.id} expired. Marking payment as expired...`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(
        `payment intent ${session.id} failed. Marking payment as failed...`,
      );
      break;
    }
    default: {
      console.log(`Unhandled event type: ${event.type}`);
      return { message: `Unhandled event type: ${event.type}` };
    }
  }
  return { message: `Webhook event ${event.id} processed successfully` };
};

export const paymentService = {
  handlerStripeWebhookEvent,
};
