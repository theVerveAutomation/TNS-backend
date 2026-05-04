const { getSafeMediaFilePath } = require("../services/media.service.js");

const streamMedia = (req, res) => {
    try {
        const dbPath = req.query.path; // e.g., "/alerts/clips/cam1_tussle.mp4"
        console.log("dbpath", dbPath)

        // 1. Get the validated, secure absolute file path from the service
        const absoluteFilePath = getSafeMediaFilePath(dbPath);

        // 2. Stream the file (Automatically handles video skipping / HTTP 206)
        res.sendFile(absoluteFilePath, (err) => {
            if (err && !res.headersSent) {
                console.error("[Media Controller] Error streaming file:", err);
                res.status(500).send('Error streaming media file');
            }
        });

    } catch (error) {
        // Handle specific business logic errors thrown by the service
        switch (error.message) {
            case 'MISSING_PATH':
                return res.status(400).send('Path parameter is required');
            case 'FORBIDDEN':
                return res.status(403).send('Forbidden: Invalid path traversal');
            case 'NOT_FOUND':
                console.warn(`[Media Controller] File not found or processing: ${req.query.path}`);
                return res.status(404).send('Media not found or is still processing');
            default:
                console.error("[Media Controller] Unexpected Error:", error);
                return res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = { streamMedia };