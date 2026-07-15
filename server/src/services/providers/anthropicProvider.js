import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const client = apiKey ? new Anthropic({ apiKey }) : null;

export const name = "anthropic";

export function isAvailable() {
  return Boolean(client);
}

export async function askJson({ system, prompt, imageBase64, imageMediaType }) {
  const content = [];
  if (imageBase64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: imageMediaType || "image/jpeg", data: imageBase64 },
    });
  }
  content.push({ type: "text", text: prompt });

  const response = await client.messages.create({
    model,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content }],
  });

  const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("AI_PARSE_ERROR");
  return JSON.parse(jsonMatch[0]);
}
