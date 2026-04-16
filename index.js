import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import http from "http";

import authRoutes from "./routes/auth.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import auditLogRoutes from "./routes/auditlog.routes.js";
import authLogRoutes from "./routes/authlog.routes.js";
import cameraRoutes from "./routes/camera.routes.js";
import cameraExceptionRoutes from "./routes/cameraexception.routes.js";
import cameraFeatureRoutes from "./routes/camerafeature.routes.js";
import cameraSnapRoutes from "./routes/camerasnap.routes.js";
import featureRoutes from "./routes/feature.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { initSocket } from "./socket.js";
import { loginLimiter } from "./middleware/rateLimiter.js";
import { protect } from "./middleware/auth.middleware.js";
import { sessionTimeout } from "./middleware/session.middleware.js";
import "./jobs/cron.jobs.js";
import sequelize from "./config/db.js";
import { getIO } from "./socket.js";

// ── Force model registration so all associations (belongsTo/hasMany) are active ──
import "./models/Alert.js";
import "./models/Camera.js";
import "./models/User.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/auditlogs", auditLogRoutes);
app.use("/api/authlogs", authLogRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/cameraexceptions", cameraExceptionRoutes);
app.use("/api/camerafeatures", cameraFeatureRoutes);
app.use("/api/camerasnaps", cameraSnapRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

// Protected route
app.get(
    "/api/dashboard",
    protect,
    sessionTimeout,
    (req, res) => {
        res.json({
            message: "Secure dashboard access granted",
            user: req.user
        });
    }
);

app.use("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the TNS Management System API",
        status: "success"
    });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", status: "fail" });
});

const server = http.createServer(app);

// Initialize socket
initSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

sequelize
    .sync({ alter: true })
    .then(() => console.log("✅ Database & tables synced successfully!"))
    .catch((err) => console.error("❌ Error syncing database:", err));