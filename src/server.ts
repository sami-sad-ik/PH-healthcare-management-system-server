import app from "./app";
import { envVar } from "./config/env";

const port = envVar.PORT || 5000;

const main = () => {
  app.listen(port, () => console.log(`server is running on port ${port}`));
};

main();
