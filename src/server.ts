import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { envVar } from "./config/env";
import { seedSuperAdmin } from "./utils/seed";

const port = envVar.PORT || 5000;

const main = async () => {
  await seedSuperAdmin();
  app.listen(port, () => console.log(`server is running on port ${port}`));
};

main();
