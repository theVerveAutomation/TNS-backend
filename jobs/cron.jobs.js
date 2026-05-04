// jobs/cron.jobs.js
const cron = require("node-cron");
const { User } = require("../models/User.js");
const { AuthLog } = require("../models/AuthLog.js");

// ⛔ Suspend inactive > 90 days
cron.schedule("0 0 * * *", async () => {
    const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await User.update(
        { status: "suspended", suspendedAt: new Date() },
        {
            where: {
                lastLoginAt: { [User.sequelize.Op.lt]: date },
                status: "active"
            }
        }
    );
});

// 🗑️ Delete after 6 months
cron.schedule("0 0 * * *", async () => {
    const date = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    await User.destroy({
        where: {
            status: "suspended",
            suspendedAt: { [User.sequelize.Op.lt]: date }
        }
    });
});

cron.schedule("0 0 * * *", async () => {
    const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    await AuthLog.destroy({
        where: {
            createdAt: { [AuthLog.sequelize.Op.lt]: date }
        }
    });
});