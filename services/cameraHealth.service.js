import { Camera } from "../models/Camera.js";

const MEDIAMTX_BASE_URL = process.env.MEDIAMTX_URL || "http://localhost:8889";

// ✅ Check camera via MediaMTX stream endpoint
const checkCamera = async (cameraId) => {
  try {
    const res = await fetch(`${MEDIAMTX_BASE_URL}/live/cam_${cameraId}/`);
    return res.ok;
  } catch {
    return false;
  }
};

// ✅ Run all camera checks in parallel (fast + non-blocking)
export const runCameraHealthCheck = async () => {
  const cameras = await Camera.findAll();

  await Promise.all(
    cameras.map(async (cam) => {
      try {
        const isAlive = await checkCamera(cam.id);

        await cam.update({
          status: isAlive ? "normal" : "offline",
        });
      } catch {
        await cam.update({ status: "offline" });
      }
    })
  );
};