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
];

function containsCrisisText(note: string) {
  const normalized = note.toLowerCase();

  return crisisKeywords.some((keyword) => normalized.includes(keyword));
}

function getFallbackInsight(
  input: EmotionalInsightInput,
): EmotionalInsightResult {
  if (containsCrisisText(input.note)) {
    return {
      title: "Please seek support now.",
      insight:
        "This sounds like a serious and painful moment. You should not stay alone with this feeling.",
      action:
        "Contact local emergency support or someone you trust immediately.",
    };
  }

  if (input.anxiety >= 8) {
    return {
      title: "Your system feels activated.",
      insight:
        "Your anxiety level is high, so your body may be trying to protect you even if there is no immediate danger.",
      action: "Try one slow exhale before doing anything else.",
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

  return {
    title: "You created a moment of awareness.",
    insight:
      "Naming your state helps turn emotional noise into something you can understand.",
    action: "Come back later and check if the feeling changed.",
  };
}

function extractJson(content: string): EmotionalInsightResult {
  const match = content.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("AI response did not contain JSON.");
  }

  const parsed = JSON.parse(match[0]);

  return {
    title: String(parsed.title || "You created a moment of awareness."),
    insight: String(parsed.insight || "You noticed what is happening inside."),
    action: String(parsed.action || "Take one small gentle step next."),
  };
}

export async function getEmotionalInsight(
  input: EmotionalInsightInput,
): Promise<EmotionalInsightResult> {
  if (containsCrisisText(input.note)) {
    return getFallbackInsight(input);
  }

  if (!OPENROUTER_API_KEY) {
    return getFallbackInsight(input);
  }

  try {
    const prompt = `
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
- avoid generic phrases like "feeling X but Y"
- sound natural, like a human reflection

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
  "title": "short human reflection, not generic, sound like inner thought",
  "insight": "supportive insight, max 2 sentences",
  "action": "one tiny next step, max 1 sentence"
}
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.35,
          max_tokens: 220,
        }),
      },
    );

    if (!response.ok) {
      return getFallbackInsight(input);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return getFallbackInsight(input);
    }

    return extractJson(content);
  } catch {
    return getFallbackInsight(input);
  }
}
