/**
 * Build UTC starts_at / ends_at from local date + HH:MM times.
 * Overnight shifts (end <= start) roll ends_at to the next calendar day.
 */
export function buildEventTimestamps(date, startTime, endTime) {
  if (!date || !startTime || !endTime) {
    return { startsAt: null, endsAt: null };
  }

  const dateStr = String(date).slice(0, 10);
  const start = String(startTime).slice(0, 5);
  const end = String(endTime).slice(0, 5);

  const startsAt = new Date(`${dateStr}T${start}:00.000Z`);
  let endsAt = new Date(`${dateStr}T${end}:00.000Z`);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { startsAt: null, endsAt: null };
  }

  if (endsAt.getTime() <= startsAt.getTime()) {
    endsAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
  }

  return { startsAt, endsAt };
}
