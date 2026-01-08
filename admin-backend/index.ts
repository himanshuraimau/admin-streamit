import express from "express";
import cors from "cors";
import { auth } from "./src/lib/auth.js";
import adminRoutes from "./src/routes/admin.route.js";
import type { Request,Response } from "express";

const app = express();

// CORS - allow admin frontend only
app.use(
  cors({
    origin: process.env.ADMIN_FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    service: "admin-backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Better Auth routes
app.use("/api/auth", auth.handler);

// Admin routes
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Admin backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/*`);
  console.log(`⚙️  Admin API: http://localhost:${PORT}/api/admin/*`);
});

export default app;