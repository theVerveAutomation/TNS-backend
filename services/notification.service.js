import notifier from "node-notifier";
import path from "path";
import { getIO } from "../socket.js";
import { AlertSchedule } from "../models/AlertSchedule.js";
import { isWithinSchedule } from "../utils/scheduleChecker.js";
import { Camera } from "../models/Camera.js";

const iconPath = path.resolve("assets/logo2.png");

export const sendAlertNotification = async (alert) => {
  const camera = await Camera.findByPk(alert.cameraId);

  if (!camera) {
    console.log("❌ Camera not found for alert:", alert.cameraId);
    return;
  }

  const schedule = await AlertSchedule.findOne({
    where: { organizationId: camera.organizationId },
  });

  if (!isWithinSchedule(schedule)) {
    console.log("⛔ Notification blocked by schedule");
    return;
  }

  notifier.notify(
    {
      title: `🚨 ${alert.severity} Alert`,
      message: `${alert.alertType} - Camera ${camera.name}`,
      icon: iconPath,
      appID: "Video Analytics Pro",
      sound: camera.alertSound,
      silent: !camera.alertSound,
      wait: true,
      actions: ["Mark as Reviewed"],
    },
    async (err, response, metadata) => {
      if (err) {
        console.error("Notification error:", err);
        return;
      }

      console.log("🧪 Notification debug:", { response, metadata });

      const clicked =
        response === "activate" ||
        response === "clicked" ||
        metadata?.activationType ||
        metadata?.action;

      if (clicked) {
        const schedule = await AlertSchedule.findOne({
          where: { organizationId: camera.organizationId },
        });

        if (!isWithinSchedule(schedule)) {
          console.log("⛔ Notification blocked by schedule");
          return;
        }

        const io = getIO();
        io.emit("open_review_modal", {
          alertId: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          cameraId: alert.cameraId,
        });
      }
    }
  );
};