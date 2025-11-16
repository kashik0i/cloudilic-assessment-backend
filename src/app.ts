import express from "express";
import cors from "cors";
import type { DataSource } from "typeorm";
import { makeContainer } from "./config/container";
import type { AppContainer } from "./types/container";
import pdfRoutes from "./routes/pdf";
import chatRoutes from "./routes/chat";
import { requestId } from "./middleware/requestId";
import { createHttpLogger } from "./config/logger";
import { errorHandler } from "./middleware/error";
import type { Express as ExpressApp } from "express";

export function buildApp(ds: DataSource): { app: ExpressApp; container: AppContainer } {
  const app = express();
  const container = makeContainer(ds, process.env);

  app.use(cors());
  app.use(express.json());
  app.use(requestId);
  app.use(createHttpLogger(container.logger));

  app.use((req, _res, next) => {
    req.container = container;
    next();
  });

  app.use("/", pdfRoutes);
  app.use("/", chatRoutes);

  // Centralized error handler last
  app.use(errorHandler);

  return { app, container };
}
