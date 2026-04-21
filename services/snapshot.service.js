import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow overriding the alerts directory in production via env var.
// Fallback: the shared storage sits next to the project root (`Tao Nan School`),
// so go up two directories from `services` to reach it.
const ALERTS_BASE_DIR = process.env.ALERTS_BASE_DIR
    ? path.resolve(process.env.ALERTS_BASE_DIR)
    : path.resolve(__dirname, '../../shared_storage/alerts');

export const getCameraFolders = () => {
    if (!fs.existsSync(ALERTS_BASE_DIR)) return [];

    // Read the directories inside /alerts/
    const items = fs.readdirSync(ALERTS_BASE_DIR, { withFileTypes: true });
    const cameras = [];

    items.forEach(item => {
        // Every folder inside /alerts/ represents a cameraId
        if (item.isDirectory()) {
            cameras.push({
                name: item.name,
                type: 'File folder'
            });
        }
    });

    return cameras;
};

export const getSnapshotsByCamera = (camId) => {
    // NEW PATH LOGIC: shared_storage/alerts/{camId}/snapshots
    const snapshotsDir = path.join(ALERTS_BASE_DIR, camId, 'snapshots');

    if (!fs.existsSync(snapshotsDir)) {
        console.warn(`Directory does not exist: ${snapshotsDir}`);
        return [];
    }

    const files = fs.readdirSync(snapshotsDir);
    console.log(`Found files in ${snapshotsDir}:`, files);
    const snapshots = [];

    files.forEach(file => {
        if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const filePath = path.join(snapshotsDir, file);
            const stats = fs.statSync(filePath);

            snapshots.push({
                filename: file,
                mediaPath: `/${camId}/snapshots/${file}`,
                size: stats.size,
                createdAt: stats.mtime
            });
        }
    });

    // Sort newest first
    return snapshots.sort((a, b) => b.createdAt - a.createdAt);
};