import express, { Request, Response } from "express";
import { indexRoutes } from "./Routes";
import { globalErrorHandler } from "./Middleware/globalErrorHandler";
import { notFound } from "./Middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import path from "path";
import cors from "cors";
import { envVar } from "./config/env";
import qs from "qs";

const app = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/templates`));

app.use(
  cors({
    origin: [
      envVar.FRONTEND_URL,
      envVar.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", indexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
