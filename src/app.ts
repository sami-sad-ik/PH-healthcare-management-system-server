import express, { Request, Response } from "express";
import { indexRoutes } from "./Routes";
import { globalErrorHandler } from "./Middleware/globalErrorHandler";
import { notFound } from "./Middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import path from "path";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`));

app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

// app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", indexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
