const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const http = require("http");

const authRoutes = require("./routes/auth.routes.js");
const alertRoutes = require("./routes/alert.routes.js");
const auditLogRoutes = require("./routes/auditlog.routes.js");
const authLogRoutes = require("./routes/authlog.routes.js");
const cameraRoutes = require("./routes/camera.routes.js");
const cameraExceptionRoutes = require("./routes/cameraexception.routes.js");
const cameraFeatureRoutes = require("./routes/camerafeature.routes.js");
const featureRoutes = require("./routes/feature.routes.js");
const userRoutes = require("./routes/user.routes.js");
const analyticsRoutes = require("./routes/analytics.routes.js");
const reportRoutes = require("./routes/report.routes.js");
const alertScheduleRoutes = require("./routes/alertSchedule.routes.js");
const mediaRoutes = require("./routes/media.routes.js");
const snapshotRoutes = require("./routes/snapshot.route.js");
const clipRoutes = require("./routes/clip.route.js");
const { getDashboardAlertsSummary } = require("./controllers/dashboard.controller.js");
const { runCameraHealthCheck } = require("./services/cameraHealth.service.js");
const { initSocket } = require("./socket.js");
const { loginLimiter } = require("./middleware/rateLimiter.js");
const { protect } = require("./middleware/auth.middleware.js");
const { sessionTimeout } = require("./middleware/session.middleware.js");
require("./jobs/cron.jobs.js");
const sequelize = require("./config/db.js");

require("./models/Alert.js");
require("./models/Camera.js");
require("./models/index.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
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
app.use("/api/features", featureRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/alert-schedule", alertScheduleRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/snapshots", snapshotRoutes);
app.use('/api/clips', clipRoutes);
app.get("/api/dashboard/alerts-summary", getDashboardAlertsSummary);

// Protected route
app.get(
    "/api/dashboard",
    protect,
    sessionTimeout,
    (req, res) => {
        res.json({
            message: "Secure dashboard access granted",
            user: req.user,
        });
    }
);

app.use("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the TNS Management System API",
        status: "success",
    });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", status: "fail" });
});

const server = http.createServer(app);

// Initialize socket
initSocket(server);

sequelize
    .sync({ alter: true })
    .then(() => {
        console.log("✅ Database & tables synced successfully!");

        let isRunning = false;

        setInterval(async () => {
            if (isRunning) return;
            isRunning = true;

            try {
                await runCameraHealthCheck();
            } catch (err) {
                console.error("❌ Camera health check error:", err);
            } finally {
                isRunning = false;
            }
        }, 10000);

        server.listen(PORT, () =>
            console.log(`🚀 Server running on port ${PORT}`)
        );
    })
    .catch((err) => console.error("❌ Error syncing database:", err));