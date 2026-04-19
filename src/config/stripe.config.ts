import Stripe from "stripe";
import { envVar } from "./env";

export const stripe = new Stripe(envVar.STRIPE.STRIPE_SECRET_KEY);
