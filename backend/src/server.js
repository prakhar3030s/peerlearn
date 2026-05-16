import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { ensureSupabase } from "./db/supabase.js";
import syllabusRoutes from "./routes/syllabus.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import flagsRoutes from "./routes/flags.routes.js";
import searchRoutes from "./routes/search.routes.js";
import usersRoutes from "./routes/users.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"];

app.use(helmet());
app.use(apiLimiter);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

const morganFormat =
  process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

app.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    const supabase = ensureSupabase();
    const { error } = await supabase
      .from("submissions")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) throw error;
  } catch {
    dbStatus = "unreachable";
  }
  res.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/syllabus", syllabusRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/flags", flagsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`PeerLearn backend listening on port ${PORT}`);
});

function shutdown() {
  console.log("Server shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

