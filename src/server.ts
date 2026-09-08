import { Server } from "node:http";
import app from "./app";
import { envVar } from "./config/env";
import { seedSuperAdmin } from "./utils/seed";

const port = envVar.PORT || 5000;

let server: Server;

const main = async () => {
  await seedSuperAdmin();
  server = app.listen(port, () =>
    console.log(`server is running on port ${port}`),
  );
};

//SIGINT handler
process.on("SIGINT", () => {
  console.log("SIGINT signal received ... shutting down the server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

//SIGTERM handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received ... shutting down the server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

//uncaught exception handler
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected ... shutting down the server", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

//unhandled rejection handler
process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected ... shutting down the server", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

main();
