import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../generated/prisma/enums";
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
      });

      if (!appointment) {
        console.log("appointment not found");
        return { message: "appointment not found" };
      }
      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
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
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });
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
