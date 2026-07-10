import { getKeyForModel } from "./apiKeyStore";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class MissingApiKeyError extends Error {
  provider: string;
  constructor(provider: string) {
    super(`Missing API key for ${provider}. Add it in Settings → API Keys.`);
    this.provider = provider;
  }
}

export class ProviderError extends Error {
  provider: string;
  status: number;
  constructor(provider: string, status: number, message: string) {
    super(message);
    this.provider = provider;
    this.status = status;
  }
}

// Turn a provider's HTTP failure into one short human sentence instead of a
// raw JSON dump — this string is rendered directly in chat bubbles and toasts.
async function providerError(provider: string, res: Response): Promise<ProviderError> {
  let detail = "";
  try {
    const j = JSON.parse(await res.text());
    detail = j?.error?.message ?? j?.message ?? (Array.isArray(j) ? j[0]?.error?.message : "") ?? "";
  } catch {
    /* body wasn't JSON */
  }
  const status = res.status;
  let msg: string;
  if (status === 401 || status === 403 || /api key not valid|invalid api key|incorrect api key|invalid x-api-key/i.test(detail)) {
    msg = `Your ${provider} API key was rejected. Double-check the key in Settings → API Keys.`;
  } else if (status === 429 || /quota|rate limit/i.test(detail)) {
    msg = `${provider} rate limit or quota reached. Wait a minute and try again, or check your ${provider} usage limits.`;
  } else if (status === 404 || /not found|does not exist|is not supported/i.test(detail)) {
    msg = `This model isn't available on your ${provider} account. Pick a different model and try again.`;
  } else if (detail) {
    msg = `${provider}: ${detail.length > 160 ? detail.slice(0, 160) + "…" : detail}`;
  } else {
    msg = `${provider} request failed (HTTP ${status}). Please try again in a moment.`;
  }
  return new ProviderError(provider, status, msg);
}

const OPENAI_MODELS: Record<string, string> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
};
const ANTHROPIC_MODELS: Record<string, string> = {
  "claude-sonnet": "claude-sonnet-4-20250514",
  "claude-haiku": "claude-haiku-4-5",
};
const GOOGLE_MODELS: Record<string, string> = {
  "gemini-flash": "gemini-2.0-flash",
  "gemini-pro": "gemini-2.5-pro",
};

export async function chatComplete(
  modelId: string,
  systemPrompt: string,
  history: ChatMessage[]
): Promise<string> {
  const { provider, key } = getKeyForModel(modelId);
  if (!key) throw new MissingApiKeyError(provider);

  if (provider === "OpenRouter") {
    // Strip optional "openrouter/" prefix; pass through any other slug (e.g. "meta-llama/llama-3.1-8b-instruct")
    const model = modelId.startsWith("openrouter/") ? modelId.slice("openrouter/".length) : modelId;
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://osciva.io",
        "X-Title": "Osciva AI",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });
    if (!res.ok) throw await providerError("OpenRouter", res);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "OpenAI") {
    const model = OPENAI_MODELS[modelId] ?? modelId;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });
    if (!res.ok) throw await providerError("OpenAI", res);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  if (provider === "Anthropic") {
    const model = ANTHROPIC_MODELS[modelId] ?? modelId;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      }),
    });
    if (!res.ok) throw await providerError("Anthropic", res);
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  // Google
  const model = GOOGLE_MODELS[modelId] ?? modelId;
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  );
  if (!res.ok) throw await providerError("Google AI", res);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export function buildSystemPrompt(opts: {
  agentName: string;
  instructions: string;
  personality: string;
  sources: { name: string; type: string; status: string }[];
}) {
  const indexed = opts.sources.filter((s) => s.status === "Indexed ✓");
  const kb =
    indexed.length > 0
      ? `\n\nKnowledge base sources (treat as authoritative business data):\n${indexed
          .map((s, i) => `${i + 1}. ${s.name} (${s.type})`)
          .join("\n")}`
      : "";
  return `You are ${opts.agentName || "an AI assistant"}. Personality: ${opts.personality}.\n\n${opts.instructions}${kb}`;
}
