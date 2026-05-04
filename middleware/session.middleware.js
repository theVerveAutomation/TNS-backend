// middleware/session.middleware.js
const { User } = require("../models/User.js");

const sessionTimeout = async (req, res, next) => {
    const user = req.user;

    const now = Date.now();
    const last = new Date(user.lastActivityAt).getTime();

    const timeout =
        user.role === "admin"
            ? 5 * 60 * 1000
            : 15 * 60 * 1000;

    if (now - last > timeout) {
        return res.status(401).json({ message: "Session expired" });
    }

    // update activity
    await User.update(
        { lastActivityAt: new Date() },
        { where: { id: user.id } }
    );

    next();
};

module.exports = { sessionTimeout };