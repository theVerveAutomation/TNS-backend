import notifier from "node-notifier";
import { getIO } from "../socket.js";

export const sendAlertNotification = (alert) => {
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
    (err, response, metadata) => {
      if (err) {
        console.error("Notification error:", err);
        return;
      }

      console.log("🧪 Notification debug:", { response, metadata });

      if (
        response === "activate" ||
        response === "mark as reviewed" ||         // ✅ lowercase button response
        metadata?.action === "buttonClicked" ||    // ✅ generic button action
        metadata?.activationType === "Mark as Reviewed"
      ) {
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