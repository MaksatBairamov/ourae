import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Image is required",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze only visible facial expression and observable visual cues.

Return ONLY valid JSON:

{
  "mood": string,
  "stress": number,
  "tiredness": number,
  "confidence": number,
  "suggestion": string
}

Guidelines:
- This is a visual estimate only.
- Do not diagnose mental or physical health conditions.
- Do not infer private information.
- Base the response only on what is visible in the image.
- stress, tiredness, confidence must be integers from 0 to 100.
- mood should be a short label.
- suggestion should be one short practical action.
- Return JSON only.
              `,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${image}`,
              detail: "high",
            },
          ],
        },
      ],
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}