import express, { Request, Response } from "express";
import { indexRoutes } from "./Routes";
import { globalErrorHandler } from "./Middleware/globalErrorHandler";
import { notFound } from "./Middleware/notFound";
// import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());

// app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", indexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
