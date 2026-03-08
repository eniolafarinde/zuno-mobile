import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import taskRoutes from "./routes/task.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes);
  app.use("/", userRoutes);
  app.use("/", taskRoutes);

  // fallback
  app.use((_req, res) => res.status(404).json({ message: "Not found" }));

  return app;
}