import * as anthropicProvider from "./providers/anthropicProvider.js";
import * as openaiProvider from "./providers/openaiProvider.js";
import * as groqProvider from "./providers/groqProvider.js";

const PROVIDERS = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  groq: groqProvider,
};

// Auto-detect priority when AI_PROVIDER isn't set (or its key is missing).
const AUTO_DETECT_ORDER = [anthropicProvider, openaiProvider, groqProvider];

function resolveProvider() {
  const requested = (process.env.AI_PROVIDER || "").trim().toLowerCase();

  if (requested) {
    if (!PROVIDERS[requested]) {
      console.warn(
        `[aiProvider] Unknown AI_PROVIDER "${requested}" (expected "anthropic", "openai", or "groq") — falling back to auto-detect.`
      );
    } else if (PROVIDERS[requested].isAvailable()) {
      return PROVIDERS[requested];
    } else {
      console.warn(
        `[aiProvider] AI_PROVIDER="${requested}" requested but its API key is not set — falling back to auto-detect.`
      );
    }
  }

  // Auto-detect: prefer Anthropic, then OpenAI, then Groq — whichever has a key set.
  return AUTO_DETECT_ORDER.find((provider) => provider.isAvailable()) || null;
}

const activeProvider = resolveProvider();

export function isAiEnabled() {
  return activeProvider !== null;
}

export function getProviderName() {
  return activeProvider ? activeProvider.name : null;
}

export async function askAiJson(opts) {
  if (!activeProvider) throw new Error("AI_DISABLED");
  return activeProvider.askJson(opts);
}
