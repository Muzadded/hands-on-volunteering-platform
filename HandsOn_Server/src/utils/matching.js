export function normalizeTags(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((v) => String(v).trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  }
  return [
    ...new Set(
      String(value)
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

export function overlapCount(a = [], b = []) {
  const setB = new Set((b || []).map((x) => String(x).toLowerCase()));
  return (a || []).filter((x) => setB.has(String(x).toLowerCase())).length;
}

export function scoreEventForUser(user, event) {
  const skills = normalizeTags(user?.skills);
  const causes = normalizeTags(user?.causes);
  const tags = normalizeTags(event?.tags?.length ? event.tags : [event?.category]);

  const skillOverlap = overlapCount(skills, tags);
  const causeOverlap = overlapCount(causes, tags);
  const categoryCause =
    event?.category && causes.includes(String(event.category).toLowerCase()) ? 1 : 0;

  // No dedicated user.location yet — soft match if any cause token appears in location text
  const location = String(event?.location || "").toLowerCase();
  const locationMatch = causes.some((c) => c.length > 2 && location.includes(c)) ? 1 : 0;

  const score = skillOverlap * 3 + causeOverlap * 2 + categoryCause * 2 + locationMatch;

  return {
    score,
    breakdown: { skillOverlap, causeOverlap, categoryCause, locationMatch },
  };
}

export function hoursBetween(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const toMinutes = (t) => {
    const [h, m] = String(t).split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const diff = toMinutes(endTime) - toMinutes(startTime);
  if (diff <= 0) return 0;
  return Math.round((diff / 60) * 100) / 100;
}
