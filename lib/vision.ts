export type VisualMoodResult = {
  mood: string;
  stress: number;
  tiredness: number;
  confidence: number;
  suggestion: string;
};

const USE_MOCK_VISUAL_MOOD = true;

export async function analyzeVisualMood(
  imageBase64: string,
): Promise<VisualMoodResult> {
  if (USE_MOCK_VISUAL_MOOD) {
    return {
      mood: "Neutral",
      stress: 20,
      tiredness: 15,
      confidence: 80,
      suggestion: "Take a short pause and continue your check-in.",
    };
  }

  try {
    const response = await fetch("/api/visual-mood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Visual mood request failed (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();

    return {
      mood: data.mood ?? "Neutral",
      stress: Number(data.stress ?? 0),
      tiredness: Number(data.tiredness ?? 0),
      confidence: Number(data.confidence ?? 0),
      suggestion: data.suggestion ?? "Take a moment to check in with yourself.",
    };
  } catch (error) {
    console.error("Visual mood analysis error:", error);

    return {
      mood: "Unavailable",
      stress: 0,
      tiredness: 0,
      confidence: 0,
      suggestion: "Unable to analyze image right now. Please try again.",
    };
  }
}
