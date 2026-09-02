import "./loadEnv.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import orgRoutes from "./routes/organizations.js";
import policyRoutes from "./routes/policies.js";
import templateRoutes from "./routes/templates.js";
import aiRoutes from "./routes/ai.js";
import complianceRoutes from "./routes/compliance.js";
import uploadRoutes from "./routes/uploads.js";
import dashboardRoutes from "./routes/dashboard.js";
import notificationRoutes from "./routes/notifications.js";
import ackRoutes from "./routes/acknowledgments.js";
import workflowRoutes from "./routes/workflows.js";
import regulationRoutes from "./routes/regulations.js";
import activityRoutes from "./routes/activity.js";
import standardsRoutes from "./routes/standards.js";
import exportRoutes from "./routes/export.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

await fs.mkdir(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => res.json({ ok: true, name: "CompliNova AI API" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/acknowledgments", ackRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/regulations", regulationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/standards", standardsRoutes);
app.use("/api/export", exportRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;

try {
  await connectDB();
  const server = app.listen(port, () => console.log(`CompliNova AI API listening on :${port}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Stop the other API process (Task Manager → Node) or set PORT=5001 in server/.env`
      );
      process.exit(1);
    }
    throw err;
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
