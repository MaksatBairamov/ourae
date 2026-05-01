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

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || "openai/gpt-4o-mini";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 12000;
const MAX_NOTE_LENGTH = 700;

const crisisKeywords = [
  "die",
  "dying",
  "kill myself",
  "suicide",
  "end my life",
  "hurt myself",
  "self harm",
  "self-harm",
  "want to disappear",
  "do not want to live",
  "i don't want to live",
  "i dont want to live",
  "i want to die",
  "i want to kill myself",
];

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

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

function extractJson(content: string): EmotionalInsightResult {
  const match = content.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("AI response did not contain JSON.");
  }

  const parsed = JSON.parse(match[0]);

  return {
    title: safeString(parsed.title, "You created a moment of awareness.", 80),
    insight: safeString(
      parsed.insight,
      "You noticed what is happening inside.",
      260,
    ),
    action: safeString(parsed.action, "Take one small gentle step next.", 140),
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildPrompt(input: EmotionalInsightInput) {
  return `
You are Ourae, a calm emotional wellness assistant.

Analyze this check-in and return ONLY valid JSON.

Rules:
- Do not diagnose.
- Do not claim to be a therapist.
- Do not mention medical advice.
- Keep the tone calm, short, and human.
- Use simple language.
- Give one tiny next step.
- No markdown.
- Avoid generic phrases like "feeling X but Y".
- Sound natural, like a human reflection.
- Do not overpromise.
- Do not say everything will be okay.

If the user mentions death, suicide, self-harm, or wanting to disappear:
- do not give a normal reflection
- respond with a calm safety-focused message
- encourage contacting local emergency support or a trusted person immediately

User check-in:
Mood: ${input.mood}
Energy: ${input.energy}/10
Anxiety: ${input.anxiety}/10
Note: "${input.note || "No note provided"}"

Return this JSON shape:
{
  "title": "short human reflection, not generic",
  "insight": "supportive insight, max 2 sentences",
  "action": "one tiny next step, max 1 sentence"
}
`;
}

export async function getEmotionalInsight(
  rawInput: EmotionalInsightInput,
): Promise<EmotionalInsightResult> {
  const input = sanitizeInput(rawInput);

  if (containsCrisisText(input.note)) {
    return getFallbackInsight(input);
  }

  if (!OPENROUTER_API_KEY) {
    return getFallbackInsight(input);
  }

  try {
    const response = await fetchWithTimeout(
      OPENROUTER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ourae.local",
          "X-Title": "Ourae",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: buildPrompt(input),
            },
          ],
          temperature: 0.35,
          max_tokens: 220,
        }),
      },
      REQUEST_TIMEOUT_MS,
    );

    if (!response.ok) {
      return getFallbackInsight(input);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return getFallbackInsight(input);
    }

    return extractJson(content);
  } catch (error) {
    console.error("Failed to get emotional insight:", error);
    return getFallbackInsight(input);
  }
}
