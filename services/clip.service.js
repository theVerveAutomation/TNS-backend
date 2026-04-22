import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALERTS_BASE_DIR = process.env.ALERTS_BASE_DIR
    ? path.resolve(process.env.ALERTS_BASE_DIR)
    : path.resolve(__dirname, '../../shared_storage/alerts');

export const getCameraFolders = () => {
    if (!fs.existsSync(ALERTS_BASE_DIR)) return [];

    const items = fs.readdirSync(ALERTS_BASE_DIR, { withFileTypes: true });
    const cameras = [];

    items.forEach(item => {
        if (item.isDirectory()) {
            cameras.push({
                name: item.name,
                type: 'File folder'
            });
        }
    });

    return cameras;
};

export const getClipsByCamera = (camId) => {
    // Look specifically inside the /clips/ directory for this camera
    const clipsDir = path.join(ALERTS_BASE_DIR, camId, 'clips');

    if (!fs.existsSync(clipsDir)) return [];

    const files = fs.readdirSync(clipsDir);
    console.log(`Found files in ${clipsDir}:`, files);
    const clips = [];

    files.forEach(file => {
        // Filter for WebM video files
        if (file.endsWith('.webm')) {
            const filePath = path.join(clipsDir, file);
            const stats = fs.statSync(filePath);

            clips.push({
                filename: file,
                // Construct the exact relative path for the media streamer
                mediaPath: `/${camId}/clips/${file}`,
                size: stats.size,
                createdAt: stats.mtime
            });
        }
    });

    // Sort newest first
    return clips.sort((a, b) => b.createdAt - a.createdAt);
};