import type { VercelRequest, VercelResponse } from "@vercel/node";

type InsightPayload = {
  mood: string;
  energy: number;
  anxiety: number;
  note?: string;
};

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function fallbackInsight(payload: InsightPayload) {
  if (payload.anxiety >= 8 && payload.energy <= 3) {
    return {
      title: "Safety first.",
      insight:
        "This check-in suggests high emotional pressure with low energy. Focus on grounding before trying to solve anything.",
      action: "Put both feet on the floor and take one slow exhale.",
    };
  }

  return {
    title: "You created a moment of awareness.",
    insight:
      "Naming your emotional state can make it easier to understand what is happening.",
    action: "Choose one small next step that feels realistic.",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OpenRouter API key" });
  }

  const payload = req.body as InsightPayload;

  if (!payload || typeof payload.mood !== "string") {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ourae.vercel.app",
          "X-Title": "Ourae",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a careful emotional wellness reflection assistant. Do not diagnose. Do not give medical advice. Keep responses short, safe, supportive, and non-clinical. Return only valid JSON with title, insight, and action.",
            },
            {
              role: "user",
              content: JSON.stringify(payload),
            },
          ],
          response_format: {
            type: "json_object",
          },
        }),
      },
    );

    if (!response.ok) {
      return res.status(200).json(fallbackInsight(payload));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(200).json(fallbackInsight(payload));
    }

    const parsed = JSON.parse(content);

    return res.status(200).json({
      title: parsed.title || fallbackInsight(payload).title,
      insight: parsed.insight || fallbackInsight(payload).insight,
      action: parsed.action || fallbackInsight(payload).action,
    });
  } catch {
    return res.status(200).json(fallbackInsight(payload));
  }
}
