import notifier from "node-notifier";
import { getIO } from "../socket.js";
import { AlertSchedule } from "../models/AlertSchedule.js";
import { isWithinSchedule } from "../utils/scheduleChecker.js";
import { Camera } from "../models/Camera.js";

export const sendAlertNotification = async (alert) => {
  const camera = await Camera.findByPk(alert.cameraId);

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
      message: `${alert.alertType} - Camera ${alert.cameraId}`,
      sound: true,
      wait: true,

      // ✅ Action button
      actions: ["Mark as Reviewed"],
      closeLabel: "Dismiss",
    },
    async (err, response, metadata) => {
      if (err) {
        console.error("Notification error:", err);
        return;
      }

      console.log("🧪 Notification debug:", { response, metadata });

      if (
        response === "activate" ||
        response === "mark as reviewed" ||          
        metadata?.action === "buttonClicked" ||     
        metadata?.activationType === "Mark as Reviewed"
      ) {
        const camera = await Camera.findByPk(alert.cameraId);

        const schedule = await AlertSchedule.findOne({
          where: { organizationId: camera.organizationId },
        });

        if (!isWithinSchedule(schedule)) {
          console.log("⛔ Notification blocked by schedule");
          return;
        }

        console.log("✅ Triggering modal for alert:", alert.id);

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