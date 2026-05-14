export type SafetyLevel = "normal" | "elevated" | "crisis";

const CRISIS_KEYWORDS = [
  "kill myself",
  "suicide",
  "end my life",
  "self harm",
  "hurt myself",
  "die",
  "i want to disappear",
];

export function detectSafetyLevel({
  note,
  anxiety,
  energy,
}: {
  note: string;
  anxiety: number;
  energy: number;
}): SafetyLevel {
  const normalizedNote = note.toLowerCase();

  const hasCrisisKeyword = CRISIS_KEYWORDS.some((keyword) =>
    normalizedNote.includes(keyword),
  );

  if (hasCrisisKeyword) return "crisis";
  if (anxiety >= 9 && energy <= 2) return "elevated";
  if (anxiety >= 8 && energy <= 3) return "elevated";

  return "normal";
}

export function getSafetyMessage(level: SafetyLevel) {
  if (level === "crisis") {
    return {
      title: "You deserve immediate support.",
      text: "This moment may be too heavy to handle alone. Please contact someone you trust or local emergency support now.",
      action: "Reach out to a real person now.",
    };
  }

  if (level === "elevated") {
    return {
      title: "Safety first.",
      text: "Your check-in suggests high emotional pressure. Before analyzing the feeling, focus on grounding your body.",
      action: "Try a guided grounding flow.",
    };
  }

  return null;
}
