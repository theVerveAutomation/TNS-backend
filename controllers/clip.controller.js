import { getCameraFolders, getClipsByCamera } from '../services/clip.service.js';

export const listFolders = (req, res) => {
    try {
        const folders = getCameraFolders();
        res.json(folders);
    } catch (error) {
        console.error("Error listing clip folders:", error);
        res.status(500).send("Server Error");
    }
};

export const listClips = (req, res) => {
    try {
        const { cameraId } = req.params;
        const clips = getClipsByCamera(cameraId);
        res.json(clips);
    } catch (error) {
        console.error("Error listing clips:", error);
        res.status(500).send("Server Error");
    }
};