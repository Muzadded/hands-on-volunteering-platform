export const HELP_POST_TYPES = [
  { value: "ask", label: "Ask for help" },
  { value: "offer", label: "Offer help" },
];

export const HELP_POST_CATEGORIES = [
  { value: "groceries", label: "Groceries" },
  { value: "medicine", label: "Medicine" },
  { value: "elderly_checkin", label: "Elderly check-in" },
  { value: "ride", label: "Ride" },
  { value: "tutoring", label: "Tutoring" },
  { value: "evacuation", label: "Evacuation" },
  { value: "other", label: "Other" },
];

/** Categories that should show crisis / emergency-services guidance. */
export const CRISIS_CATEGORIES = ["medicine", "evacuation", "elderly_checkin"];

export const CRISIS_GUIDANCE =
  "If this is a life-threatening emergency, call local emergency services immediately (Bangladesh: 999). HandsOn is for community neighbour help, not a substitute for ambulances, fire, or police.";

export function categoryLabel(value) {
  return HELP_POST_CATEGORIES.find((c) => c.value === value)?.label || value || "Other";
}

export function postTypeLabel(value) {
  return HELP_POST_TYPES.find((t) => t.value === value)?.label || value || "Ask for help";
}

export function isCrisisCategory(value) {
  return CRISIS_CATEGORIES.includes(value);
}
