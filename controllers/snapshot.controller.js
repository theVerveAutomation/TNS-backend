import { getCameraFolders, getSnapshotsByCamera } from '../services/snapshot.service.js';

export const listFolders = (req, res) => {
    try {
        const folders = getCameraFolders();
        res.json(folders);
    } catch (error) {
        console.error("Error listing folders:", error);
        res.status(500).send("Server Error");
    }
};

export const listSnapshots = (req, res) => {
    try {
        const { cameraId } = req.params;
        const snapshots = getSnapshotsByCamera(cameraId);
        res.json(snapshots);
    } catch (error) {
        console.error("Error listing snapshots:", error);
        res.status(500).send("Server Error");
    }
};