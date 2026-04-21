import { AlertSchedule } from "../models/AlertSchedule.js";

export const getSchedule = async (req, res) => {
  console.log("🧪 GET REQ USER:", req.user);
  const { organizationId } = req.user;

  let schedule = await AlertSchedule.findOne({ where: { organizationId } });

  if (!schedule) {
    schedule = await AlertSchedule.create({ organizationId });
  }

  // Patch existing records that have UTC or no timezone set
  if (!schedule.timezone || schedule.timezone === "UTC") {
    await schedule.update({ timezone: "Asia/Singapore" });
  }

  res.json(schedule);
};

export const updateSchedule = async (req, res) => {
  console.log("🧪 GET REQ USER:", req.user);
  const { organizationId } = req.user;

  const [schedule] = await AlertSchedule.findOrCreate({
    where: { organizationId },
    defaults: { organizationId },
  });

  await schedule.update(req.body);

  res.json({ message: "Schedule updated", schedule });
};