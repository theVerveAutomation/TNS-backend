const { DateTime } = require("luxon");

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

function isWithinSchedule(schedule) {
  if (!schedule || !schedule.enabled) return true;

  // 🔥 Use Singapore timezone
  const now = DateTime.now().setZone(schedule.timezone || "Asia/Singapore");

  const currentDay = now.toFormat("ccc");    // Mon, Tue
  const currentTime = now.toFormat("HH:mm"); // 24-hour format

  // ❌ Day check
  if (!schedule.daysOfWeek.includes(currentDay)) return false;

  //  Safe time range check using minutes
  const current = toMinutes(currentTime);
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);

  if (current < start || current > end) return false;

  //  Safe quiet hours check (handles overnight ranges)
  if (schedule.quietHoursEnabled) {
    const qStart = toMinutes(schedule.quietHoursStart);
    const qEnd = toMinutes(schedule.quietHoursEnd);

    if (qStart < qEnd) {
      // Normal case (e.g. 22:00 → 23:59)
      if (current >= qStart && current <= qEnd) return false;
    } else {
      // Overnight case (e.g. 22:00 → 07:00)
      if (current >= qStart || current <= qEnd) return false;
    }
  }

  return true;
}

module.exports = { isWithinSchedule };