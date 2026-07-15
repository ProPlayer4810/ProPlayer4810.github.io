import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o";
const client = apiKey ? new OpenAI({ apiKey }) : null;

export const name = "openai";

export function isAvailable() {
  return Boolean(client);
}

export async function askJson({ system, prompt, imageBase64, imageMediaType }) {
  const userContent = [{ type: "text", text: prompt }];
  if (imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${imageMediaType || "image/jpeg"};base64,${imageBase64}` },
    });
  }

  const response = await client.chat.completions.create({
    model,
    max_tokens: 1200,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AI_PARSE_ERROR");
  return JSON.parse(jsonMatch[0]);
}
