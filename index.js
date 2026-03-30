const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


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