import status from "http-status";
import { Prisma } from "../generated/prisma/client";
import { TerrResponse, TerrSources } from "../interfaces";

const getStatusCodeFromPrismaError = (errorCode: string): number => {
  // P2002 : unique constraint violation
  if (errorCode === "P2002") {
    return status.CONFLICT;
  }
  // P2025, P2001, P2015 , P2018 : not found error
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status.NOT_FOUND;
  }
  //P1000 ,P6002 : db authentication error(401)
  if (["P1000", "P6002"].includes(errorCode)) {
    return status.UNAUTHORIZED;
  }
  //P1010 , P6010 : access denied error (403)
  if (["P1010", "P6010"].includes(errorCode)) {
    return status.FORBIDDEN;
  }
  // P6003 : accelaration error
  if (errorCode === "P6003") {
    return status.PAYMENT_REQUIRED;
  }
  //P1008 , P2004 , P2008 : timeout error
  if (["P1008", "P2004", "P2008"].includes(errorCode)) {
    return status.GATEWAY_TIMEOUT;
  }
  //P5011: rate limit error
  if (errorCode === "P5011") {
    return status.TOO_MANY_REQUESTS;
  }
  //P6009 : response size limit error
  if (errorCode === "P6009") {
    return status.REQUEST_ENTITY_TOO_LARGE;
  }
  //P1xx ,P2024 , P2037 , P6008 : connection error
  if (
    errorCode.startsWith("P1") ||
    ["P2024", "P2037", "P6008"].includes(errorCode)
  ) {
    return status.SERVICE_UNAVAILABLE;
  }
  //P2xxx : unhandled error
  if (errorCode.startsWith("P2")) {
    return status.BAD_REQUEST;
  }

  return status.INTERNAL_SERVER_ERROR;
};

const formatErrorMeta = (meta?: Record<string, unknown>): string => {
  if (!meta) return "";

  const parts: string[] = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field : ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column : ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table : ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model : ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation : ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint : ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error : ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" | ") : "";
};

export const handlePrismaClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError,
): TerrResponse => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);

  let cleanMessage = error.message;

  //remove the "invalid `prisma.error.create()` invocation" from the message
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred with the database operation.";

  const errorSources: TerrSources[] = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage,
    },
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause),
    });
  }

  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errSources: errorSources,
  };
};

export const handlePrismaClientUnknownRequestError = (
  error: Prisma.PrismaClientUnknownRequestError,
): TerrResponse => {
  let cleanMessage = error.message;
  //remove the "invalid `prisma.error.create()` invocation" from the message
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred with the database operation.";

  const errorSources: TerrSources[] = [
    {
      path: "unknown_error",
      message: mainMessage,
    },
  ];
  return {
    success: false,
    statusCode: status.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errSources: errorSources,
  };
};

export const handlePrismaClientValidationError = (
  error: Prisma.PrismaClientValidationError,
) => {
  let cleanMessage = error.message;

  //remove the "invalid `prisma.error.create()` invocation" from the message
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());

  const errorSources: TerrSources[] = [];

  //extract field name for field specific validation errors
  //example : "Argument `data.email` : got invalid value ` invalid-email` on prisma.user.create()"
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "unknown_field";

  const mainMessage = lines.find(
    (line) =>
      (!line.includes("Argument") &&
        !line.includes("→") &&
        line.length > 10 &&
        line[0]) ||
      "Invalid query parameters provided to the database operation.",
  );
  errorSources.push({
    path: fieldName,
    message: mainMessage || "An error occurred with the database operation.",
  });

  return {
    success: false,
    statusCode: status.BAD_REQUEST,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errSources: errorSources,
  };
};

export const handlePrismaClientInitializationError = (
  error: Prisma.PrismaClientInitializationError,
) => {
  const statusCode = error.errorCode
    ? getStatusCodeFromPrismaError(error.errorCode)
    : status.SERVICE_UNAVAILABLE;

  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage =
    lines[0] || "An error occurred while initializing the database client.";
  const errorSources: TerrSources[] = [
    {
      path: error.errorCode || "initialization_error",
      message: mainMessage,
    },
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errSources: errorSources,
  };
};

export const handlePrismaclientRustPanicError = () => {
  const errorSources: TerrSources[] = [
    {
      path: "rust_panic_error",
      message:
        "The database client encountered a critical error and panicked. Please check the server logs for more details.",
    },
  ];

  return {
    success: false,
    statusCode: status.INTERNAL_SERVER_ERROR,
    message:
      "Prisma Client Rust Panic Error: The database client encountered a critical error and panicked.",
    errSources: errorSources,
  };
};
