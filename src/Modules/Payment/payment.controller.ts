import { envVar } from "./../../config/env";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handlerStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVar.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.log("Missing signature or webhook secret");
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Missing signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.log("Error verifying webhook signature:", err);
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Invalid signature" });
  }

  try {
    const result = await paymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Webhook event processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    sendResponse(res, {
      httpStatusCode: status.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error processing webhook event",
    });
  }
});

export const paymentController = {
  handlerStripeWebhookEvent,
};
