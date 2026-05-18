type EmotionalInsightInput = {
  mood: string;
  energy: number;
  anxiety: number;
  note: string;
};

export type EmotionalInsightResult = {
  title: string;
  insight: string;
  action: string;
};

const MAX_NOTE_LENGTH = 700;

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

const crisisKeywords = [
  "die",
  "dying",
  "kill myself",
  "suicide",
  "end my life",
  "end it all",
  "i want to end it all",
  "hurt myself",
  "self harm",
  "self-harm",
  "want to disappear",
  "do not want to live",
  "i don't want to live",
  "i dont want to live",
  "i want to die",
  "i want to kill myself",
  "can't go on",
  "cant go on",
  "no reason to live",
];

function containsCrisisText(note: string) {
  const normalized = normalizeText(note);

  return crisisKeywords.some((keyword) => normalized.includes(keyword));
}

function sanitizeInput(input: EmotionalInsightInput): EmotionalInsightInput {
  return {
    mood: input.mood.trim() || "Unknown",
    energy: Math.min(Math.max(Number(input.energy) || 0, 1), 10),
    anxiety: Math.min(Math.max(Number(input.anxiety) || 0, 1), 10),
    note: input.note.trim().slice(0, MAX_NOTE_LENGTH),
  };
}

function getFallbackInsight(
  input: EmotionalInsightInput,
): EmotionalInsightResult {
  if (containsCrisisText(input.note)) {
    return {
      title: "Please reach out now.",
      insight:
        "This sounds serious and painful. You should not stay alone with this feeling.",
      action: "Contact emergency support or someone you trust immediately.",
    };
  }

  if (input.anxiety >= 8 && input.energy <= 3) {
    return {
      title: "Your body may need safety first.",
      insight:
        "High anxiety with low energy can feel intense and exhausting. You do not need to solve everything at once.",
      action: "Put both feet on the floor and take one slow exhale.",
    };
  }

  if (input.anxiety >= 8) {
    return {
      title: "Your system feels activated.",
      insight:
        "Your anxiety level is high, so your body may be trying to protect you. Slowing down may help before taking action.",
      action: "Try one longer exhale before doing anything else.",
    };
  }

  if (input.energy <= 3) {
    return {
      title: "Your energy is asking for softness.",
      insight:
        "Low energy can make emotions feel heavier. A small reset may help more than forcing productivity.",
      action: "Drink water, sit down, or take a short quiet break.",
    };
  }

  if (input.mood === "Happy" || input.mood === "Motivated") {
    return {
      title: "There is something useful here.",
      insight:
        "This moment has some lightness or momentum in it. Noticing it can help you understand what supports you.",
      action: "Write down one thing that helped create this feeling.",
    };
  }

  return {
    title: "You created a moment of awareness.",
    insight:
      "Naming your state helps turn emotional noise into something you can understand.",
    action: "Come back later and check if the feeling changed.",
  };
}

function safeString(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;

  const cleaned = value.trim();

  if (!cleaned) return fallback;

  return cleaned.slice(0, maxLength);
}

export async function getEmotionalInsight(
  rawInput: EmotionalInsightInput,
  signal?: AbortSignal,
): Promise<EmotionalInsightResult> {
  const input = sanitizeInput(rawInput);

  if (containsCrisisText(input.note)) {
    return getFallbackInsight(input);
  }

  try {
    const response = await fetch("/api/insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal,
    });

    if (!response.ok) {
      return getFallbackInsight(input);
    }

    const data = await response.json();

    return {
      title: safeString(data.title, getFallbackInsight(input).title, 80),
      insight: safeString(data.insight, getFallbackInsight(input).insight, 260),
      action: safeString(data.action, getFallbackInsight(input).action, 140),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.error("Failed to get emotional insight:", error);
    return getFallbackInsight(input);
  }
}
