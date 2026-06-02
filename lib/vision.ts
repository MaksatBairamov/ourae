export type VisualMoodResult = {
  mood: string;
  stress: number;
  tiredness: number;
  confidence: number;
  suggestion: string;
};

export async function analyzeVisualMood(): Promise<VisualMoodResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    mood: "Tired / tense",
    stress: 68,
    tiredness: 74,
    confidence: 82,
    suggestion: "Try a 2-minute breathing exercise before continuing.",
  };
}
