import OpenAI from "openai";

// Groq exposes an OpenAI-compatible chat completions API, so the official
// "openai" SDK can talk to it directly by pointing baseURL at Groq's endpoint.
const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const client = apiKey ? new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" }) : null;

export const name = "groq";

export function isAvailable() {
  return Boolean(client);
}

export async function askJson({ system, prompt, imageBase64, imageMediaType }) {
  const userContent = [{ type: "text", text: prompt }];
  if (imageBase64) {
    // Only Groq's vision-preview models accept image input; text-only models
    // will error on this, which the caller (aiService) already catches and
    // falls back to rule-based logic for.
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
  console.log("groq resp = ", response);
  const text = response.choices[0]?.message?.content || "";
  console.log("text = ", text);
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  console.log("jsonMatch = ", jsonMatch);
  if (!jsonMatch) throw new Error("AI_PARSE_ERROR");
  return JSON.parse(jsonMatch[0]);
}
