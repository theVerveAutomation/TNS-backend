const { getCameraFolders, getSnapshotsByCamera } = require("../services/snapshot.service.js");

const listFolders = (req, res) => {
    try {
        const folders = getCameraFolders();
        res.json(folders);
    } catch (error) {
        console.error("Error listing folders:", error);
        res.status(500).send("Server Error");
    }
};

const listSnapshots = (req, res) => {
    try {
        const { cameraId } = req.params;
        const snapshots = getSnapshotsByCamera(cameraId);
        res.json(snapshots);
    } catch (error) {
        console.error("Error listing snapshots:", error);
        res.status(500).send("Server Error");
    }
};

module.exports = { listFolders, listSnapshots };
