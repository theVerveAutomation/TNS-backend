import { Camera } from "../models/Camera.js";
import net from "net";

const TIMEOUT = 3000;

const checkCamera = (ip, port = 554) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(TIMEOUT);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      resolve(false);
    });

    socket.connect(port, ip);
  });
};

export const runCameraHealthCheck = async () => {
  const cameras = await Camera.findAll();

  for (const cam of cameras) {
    try {
      if (!cam.url) {
        await cam.update({ status: "offline" });
        continue;
      }

      const parsed = new URL(cam.url);
      const ip = parsed.hostname;
      const port = parsed.port || 554;

      const isAlive = await checkCamera(ip, port);

      await cam.update({
        status: isAlive ? "normal" : "offline",
      });

    } catch (err) {
      await cam.update({ status: "offline" });
    }
  }

};