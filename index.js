import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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
import { loginLimiter } from "./middleware/rateLimiter.js";
import { protect } from "./middleware/auth.middleware.js";
import { sessionTimeout } from "./middleware/session.middleware.js";
import "./jobs/cron.jobs.js";
import sequelize from "./config/db.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Apply rate limiter only on login
app.use("/api/auth/login", loginLimiter);

// Routes
app.use("/api/auth", protect, sessionTimeout, authRoutes);
app.use("/api/alerts", protect, sessionTimeout, alertRoutes);
app.use("/api/auditlogs", protect, sessionTimeout, auditLogRoutes);
app.use("/api/authlogs", protect, sessionTimeout, authLogRoutes);
app.use("/api/cameras", protect, sessionTimeout, cameraRoutes);
app.use("/api/cameraexceptions", protect, sessionTimeout, cameraExceptionRoutes);
app.use("/api/camerafeatures", protect, sessionTimeout, cameraFeatureRoutes);
app.use("/api/camerasnaps", protect, sessionTimeout, cameraSnapRoutes);
app.use("/api/features", protect, sessionTimeout, featureRoutes);
app.use("/api/users", protect, sessionTimeout, userRoutes);

// 🔒 Example protected route
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

// 404 fallback route for everything else
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", status: "fail" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


sequelize
    .sync({ alter: true }) // Updates tables without dropping data
    .then(() => console.log("✅ Database & tables synced successfully!"))
    .catch((err) => console.error("❌ Error syncing database:", err));

// sequelize.authenticate().then(() => {
//     console.log("✅ Database connection established successfully!");
// }).catch((err) => {
//     console.error("❌ Unable to connect to the database:", err);
// });