import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../generated/prisma/enums";
import { envVar } from "../config/env";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  secret: envVar.BETTER_AUTH_SECRET,
  baseURL: envVar.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: envVar.GOOGLE_CLIENT_ID,
      clientSecret: envVar.GOOGLE_CLIENT_SECRET,

      mapProfileToUser: () => {
        return {
          role: Role.PATIENT,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          needPasswordChange: false,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  trustedOrigins: [envVar.APP_URL! || "http://localhost:5000"],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PATIENT,
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({ where: { email } });
          //otp not coming on ignoring verify first time and then login
          if (user) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            sendEmail({
              to: email,
              subject: "Reset your password",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24,
    updatesIn: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },

  advanced: {
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
          path: "/",
        },
      },
      sessionCookies: {
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
          path: "/",
        },
      },
    },
  },
});
