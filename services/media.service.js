const path = require("path");
const fs = require("fs");

// Use the same ALERTS_BASE_DIR env override as other services, with a safe
// fallback to the nearby shared_storage folder for development.
const SHARED_STORAGE_DIR = process.env.ALERTS_BASE_DIR
    ? path.resolve(process.env.ALERTS_BASE_DIR)
    : path.resolve(__dirname, '../../shared_storage/alerts');

const getSafeMediaFilePath = (dbPath) => {
    if (!dbPath) {
        throw new Error('MISSING_PATH');
    }

    // This logic remains exactly the same! 
    // If the frontend requests "?path=/cam1/snapshots/file.jpg", 
    // it will safely append it to "shared_storage/alert"
    const safeDbPath = dbPath.replace(/^(\.\.[\/\\])+/, '').replace(/^\/+/, '');
    const absoluteFilePath = path.join(SHARED_STORAGE_DIR, safeDbPath);

    if (!absoluteFilePath.startsWith(SHARED_STORAGE_DIR)) {
        throw new Error('FORBIDDEN');
    }

    if (!fs.existsSync(absoluteFilePath)) {
        throw new Error('NOT_FOUND');
    }

    return absoluteFilePath;
};

module.exports = { getSafeMediaFilePath };