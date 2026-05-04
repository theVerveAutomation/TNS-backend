const { getCameraFolders, getClipsByCamera } = require("../services/clip.service.js");

const listFolders = (req, res) => {
    try {
        const folders = getCameraFolders();
        res.json(folders);
    } catch (error) {
        console.error("Error listing clip folders:", error);
        res.status(500).send("Server Error");
    }
};

const listClips = (req, res) => {
    try {
        const { cameraId } = req.params;
        const clips = getClipsByCamera(cameraId);
        res.json(clips);
    } catch (error) {
        console.error("Error listing clips:", error);
        res.status(500).send("Server Error");
    }
};

module.exports = { listFolders, listClips };
