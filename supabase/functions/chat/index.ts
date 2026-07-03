// PUBLIC chat endpoint for the embeddable widget — MULTI-PROVIDER.
//   GET  /chat?agentId=...                       -> widget config
//   POST /chat { agentId, messages }             -> RAG retrieval + answer { reply }  (JSON)
//   POST /chat { agentId, messages, stream:true } -> same, streamed as Server-Sent Events
// Uses the AGENT OWNER's stored LLM key (OpenAI / Anthropic / Google / OpenRouter),
// looked up server-side. Visitors never see the key. Embeddings use the free
// built-in gte-small model, so RAG needs no provider key.
//
// Streaming protocol (when stream:true): text/event-stream, each event is
//   data: {"delta":"..."}            incremental text
//   data: {"done":true,"conversationId":"..."}  final marker
//   data: [DONE]
// The widget renders deltas live and falls back to JSON if the function predates
// streaming (so it degrades gracefully whether or not this file is deployed yet).
//
// Visitor conversations are logged (conversations + conversation_messages) for the
// owner's analytics. Owner "Live Test" chats pass { test:true } and are NOT logged.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

type Provider = "OpenAI" | "Anthropic" | "Google AI" | "OpenRouter";
type Msg = { role: string; content: string };

// Max visitor messages per agent per hour (per IP) when rate limiting is on.
const RATE_LIMIT_PER_HOUR = 20;

// ---- Pricing plans (profiles.plan: free | starter | growth) ----
// free:    locked to gpt-4o-mini on OSCIVA's platform key, 50 messages/month.
// starter: owner's key, budget models only (premium silently downgraded).
// growth:  owner's key, any model, custom rate limits honored.
const FREE_MONTHLY_MSGS = 50;
const FREE_MODEL = "gpt-4o-mini";
// Platform key that pays for free-tier replies. If unset, free-tier agents fall
// back to the owner's own OpenAI key (and the usual "add your key" gate).
const PLATFORM_FREE_KEY = Deno.env.get("OSCIVA_FREE_OPENAI_KEY") ?? "";

const STARTER_BUDGET: Record<Provider, string[]> = {
  OpenAI: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1-nano"],
  Anthropic: ["claude-haiku", "claude-haiku-4-5"],
  "Google AI": ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash", "gemini-2.5-flash"],
  OpenRouter: [], // OpenRouter models are budget-class; allowed as-is below
};
const STARTER_FALLBACK: Record<Provider, string> = {
  OpenAI: "gpt-4o-mini",
  Anthropic: "claude-haiku-4-5",
  "Google AI": "gemini-2.0-flash",
  OpenRouter: "openrouter/auto",
};

// Starter plan: keep budget models, downgrade premium ones to the provider's
// budget default (the reply still works — just on the affordable model).
function clampStarterModel(model: string): string {
  const provider = detectProvider(model);
  if (provider === "OpenRouter") return model;
  if (STARTER_BUDGET[provider]?.includes(model)) return model;
  return STARTER_FALLBACK[provider];
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

// Max wrong-password attempts per agent per hour (per IP) before a temporary
// lockout — throttles brute-force on password-protected agents.
const MAX_PW_ATTEMPTS = 10;

// Friendly model aliases -> real provider model ids
const OPENAI_MODELS: Record<string, string> = { "gpt-4o": "gpt-4o", "gpt-4o-mini": "gpt-4o-mini" };
const ANTHROPIC_MODELS: Record<string, string> = {
  "claude-sonnet": "claude-sonnet-4-6",
  "claude-haiku": "claude-haiku-4-5",
  "claude-opus": "claude-opus-4-8",
};
const GOOGLE_MODELS: Record<string, string> = { "gemini-flash": "gemini-2.0-flash", "gemini-pro": "gemini-2.5-pro" };

function detectProvider(modelId: string): Provider {
  if (modelId.startsWith("openrouter/") || (modelId.includes("/") && !modelId.startsWith("openai/"))) return "OpenRouter";
  if (modelId.startsWith("gpt") || modelId.startsWith("openai")) return "OpenAI";
  if (modelId.startsWith("claude")) return "Anthropic";
  if (modelId.startsWith("gemini")) return "Google AI";
  return "OpenAI";
}

// --- Access control helpers (domain whitelist + password gate) ---
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hostFrom(v: string | null): string {
  if (!v) return "";
  try {
    return new URL(v).hostname.toLowerCase();
  } catch {
    return v.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

// Normalise an owner-entered domain ("https://www.x.com/path" -> "x.com").
function normDomain(d: string): string {
  return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

// Is the request's browser origin allowed by the agent's domain whitelist?
// An empty whitelist means "allow everywhere". A non-empty whitelist with no
// usable Origin/Referer (e.g. a raw server-to-server call) is blocked.
function domainAllowed(origin: string | null, referer: string | null, domains: string[]): boolean {
  if (!domains.length) return true;
  const host = (hostFrom(origin) || hostFrom(referer)).replace(/^www\./, "");
  if (!host) return false;
  return domains.some((d) => {
    const nd = normDomain(d);
    return !!nd && (host === nd || host.endsWith("." + nd));
  });
}

async function embed(text: string): Promise<number[]> {
  // @ts-ignore - Supabase Edge Runtime built-in embeddings model
  const session = new Supabase.ai.Session("gte-small");
  // @ts-ignore
  return (await session.run(text, { mean_pool: true, normalize: true })) as number[];
}

const PERSONALITY_TONES: Record<string, string> = {
  professional: "Maintain a professional, formal, and precise tone.",
  friendly: "Be warm, friendly, and approachable.",
  concise: "Be brief and to the point — keep answers short.",
  expert: "Respond like a knowledgeable domain expert, with depth and authority.",
  empathetic: "Be understanding, caring, and empathetic.",
  playful: "Be fun, playful, and engaging.",
};

function buildSystemPrompt(agent: Record<string, unknown>, context: string): string {
  const name = (agent.name as string) || "an AI assistant";
  const personality = (agent.personality as string) || "professional";
  const tone = PERSONALITY_TONES[personality] ?? `Adopt a ${personality} tone.`;
  const instructions = ((agent.instructions as string) || "").trim();

  // The owner's instructions are the AUTHORITATIVE behaviour spec. They are
  // fenced and explicitly prioritised so the model follows them over the
  // platform's generic defaults below (which only act as a safety net).
  const head =
    `You are ${name}. ${tone}\n\n` +
    `=== OPERATING INSTRUCTIONS (set by the business owner) ===\n` +
    `These are your rules. Follow them EXACTLY and in full. They take priority over your\n` +
    `default behaviour. Obey their tone, formatting, language, and any step-by-step or\n` +
    `conditional rules they contain. Do not ignore, summarise, or deviate from them.\n\n` +
    `${instructions || "(No specific instructions provided — be a helpful, friendly assistant for this business.)"}\n` +
    `=== END OPERATING INSTRUCTIONS ===`;

  const kb = context
    ? `\n\nKNOWLEDGE BASE (the business's own information — use this as your source of facts):\n${context}\n\n` +
      `When answering factual questions (prices, policies, names, dates, contacts), use ONLY the ` +
      `knowledge base above. If the answer isn't there, say you're not sure and offer to connect the ` +
      `user with the team. Never invent facts. This factual rule never overrides the OPERATING INSTRUCTIONS.`
    : `\n\nYou currently have no knowledge base content. For specific factual questions, say you're not ` +
      `sure and offer to connect the user with the team. Never invent facts. This never overrides the ` +
      `OPERATING INSTRUCTIONS above.`;

  return head + kb;
}

const toOpenAI = (m: Msg) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content) });

// --- Build the upstream request for a provider (shared by stream + non-stream) ---
function buildRequest(
  provider: Provider,
  modelId: string,
  key: string,
  system: string,
  history: Msg[],
  stream: boolean,
): { url: string; init: RequestInit } {
  if (provider === "OpenRouter" || provider === "OpenAI") {
    const isOR = provider === "OpenRouter";
    const model = isOR
      ? (modelId.startsWith("openrouter/") ? modelId.slice("openrouter/".length) : modelId)
      : (OPENAI_MODELS[modelId] ?? modelId);
    const url = isOR
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const headers: Record<string, string> = { "content-type": "application/json", Authorization: `Bearer ${key}` };
    if (isOR) headers["X-Title"] = "Osciva AI";
    return {
      url,
      init: {
        method: "POST",
        headers,
        body: JSON.stringify({ model, stream, messages: [{ role: "system", content: system }, ...history.map(toOpenAI)] }),
      },
    };
  }

  if (provider === "Anthropic") {
    const model = ANTHROPIC_MODELS[modelId] ?? modelId;
    return {
      url: "https://api.anthropic.com/v1/messages",
      init: {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          stream,
          system,
          messages: history.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content) })),
        }),
      },
    };
  }

  // Google Gemini
  const model = GOOGLE_MODELS[modelId] ?? modelId;
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content) }],
  }));
  const action = stream ? "streamGenerateContent?alt=sse&" : "generateContent?";
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}key=${encodeURIComponent(key)}`,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents }),
    },
  };
}

// Pull one delta of text out of a parsed provider SSE event.
function deltaFrom(provider: Provider, j: Record<string, unknown>): string {
  if (provider === "OpenAI" || provider === "OpenRouter") {
    // deno-lint-ignore no-explicit-any
    return (j as any).choices?.[0]?.delta?.content ?? "";
  }
  if (provider === "Anthropic") {
    // deno-lint-ignore no-explicit-any
    return (j as any).type === "content_block_delta" ? ((j as any).delta?.text ?? "") : "";
  }
  // deno-lint-ignore no-explicit-any
  return (j as any).candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Yield trimmed lines from an upstream Response body as they arrive.
async function* sseLines(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (line) yield line;
    }
  }
  if (buf.trim()) yield buf.trim();
}

// Stream text deltas from any provider.
async function* streamLLM(
  provider: Provider,
  modelId: string,
  key: string,
  system: string,
  history: Msg[],
): AsyncGenerator<string> {
  const { url, init } = buildRequest(provider, modelId, key, system, history, true);
  const res = await fetch(url, init);
  if (!res.ok || !res.body) throw new Error(`${provider} ${res.status}: ${await res.text()}`);
  for await (const line of sseLines(res)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice(5).trim();
    if (data === "[DONE]") return;
    try {
      const d = deltaFrom(provider, JSON.parse(data));
      if (d) yield d;
    } catch {
      // ignore keep-alives / non-JSON lines
    }
  }
}

// Non-streaming single answer (used for JSON responses).
async function callLLM(
  provider: Provider,
  modelId: string,
  key: string,
  system: string,
  history: Msg[],
): Promise<string> {
  const { url, init } = buildRequest(provider, modelId, key, system, history, false);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${provider} ${res.status}: ${await res.text()}`);
  const j = await res.json();
  if (provider === "OpenAI" || provider === "OpenRouter") return j.choices?.[0]?.message?.content ?? "";
  if (provider === "Anthropic") return j.content?.[0]?.text ?? "";
  return j.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "content-type": "application/json" } });
}

// --- Conversation logging (best-effort; never breaks chat) ---
async function ensureConversation(agentId: string, ownerId: string, conversationId: string | null): Promise<string | null> {
  try {
    if (conversationId) return conversationId;
    const { data } = await admin
      .from("conversations")
      .insert({ agent_id: agentId, user_id: ownerId })
      .select("id")
      .single();
    admin.rpc("increment_agent_conversation", { p_agent_id: agentId }).then(() => {}, () => {});
    return data?.id ?? null;
  } catch {
    return null;
  }
}

// Notify the agent owner (best-effort; never breaks chat).
async function notifyOwner(userId: string, agentId: string, type: string, title: string, body: string) {
  try {
    await admin.from("notifications").insert({ user_id: userId, agent_id: agentId, type, title, body: body.slice(0, 160) });
  } catch {
    // notifications must never break the chat
  }
}

async function logTurn(conversationId: string | null, agentId: string, userText: string, assistantText: string) {
  if (!conversationId) return;
  try {
    const rows: Record<string, string>[] = [];
    if (userText) rows.push({ conversation_id: conversationId, agent_id: agentId, role: "user", content: userText });
    if (assistantText) rows.push({ conversation_id: conversationId, agent_id: agentId, role: "assistant", content: assistantText });
    if (rows.length) await admin.from("conversation_messages").insert(rows);
    await admin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), message_count: rows.length })
      .eq("id", conversationId);
  } catch {
    // analytics logging must never break the chat
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);

  try {
    // --- Widget config ---
    if (req.method === "GET") {
      const agentId = url.searchParams.get("agentId");
      if (!agentId) return json({ error: "agentId required" }, 400);
      const { data: agent } = await admin
        .from("agents")
        .select("user_id, name, welcome_msg, color, position, chat_icon, logo_url, suggestions, active, password_enabled")
        .eq("id", agentId)
        .maybeSingle();
      if (!agent || !agent.active) return json({ error: "Agent not found" }, 404);

      // "Powered by Osciva" stays on the free plan; paid plans remove it.
      const { data: prof } = await admin.from("profiles").select("plan").eq("user_id", agent.user_id).maybeSingle();
      const branding = (prof?.plan ?? "free").toLowerCase() === "free";

      // A password is only actually required if one has been set (hash exists).
      let passwordRequired = false;
      if (agent.password_enabled) {
        const { data: access } = await admin
          .from("agent_access")
          .select("password_hash")
          .eq("agent_id", agentId)
          .maybeSingle();
        passwordRequired = !!access?.password_hash;
      }

      return json({
        name: agent.name,
        welcomeMsg: agent.welcome_msg,
        color: agent.color,
        position: agent.position,
        chatIcon: agent.chat_icon,
        logoUrl: agent.logo_url ?? "",
        suggestions: agent.suggestions ?? [],
        passwordRequired,
        branding,
      });
    }

    // --- Chat ---
    if (req.method === "POST") {
      const { agentId, messages, stream, test, conversationId: convIdIn, password, verifyOnly } = await req.json();
      if (!agentId || !Array.isArray(messages)) return json({ error: "agentId and messages[] required" }, 400);

      const { data: agent } = await admin.from("agents").select("*").eq("id", agentId).maybeSingle();
      if (!agent || !agent.active) return json({ error: "Agent not found" }, 404);

      // Owner's plan drives model, key, limits and branding below.
      const { data: planRow } = await admin.from("profiles").select("plan").eq("user_id", agent.user_id).maybeSingle();
      const plan = (planRow?.plan ?? "free").toLowerCase();

      // Access control — runs BEFORE rate limiting, RAG, and any LLM call, so
      // blocked requests cost nothing. Skipped for the owner's own Live-Test.
      if (!test) {
        // 1) Domain whitelist — restrict which sites may embed this agent.
        if (Array.isArray(agent.domains) && agent.domains.length) {
          const ok = domainAllowed(req.headers.get("origin"), req.headers.get("referer"), agent.domains);
          if (!ok) {
            return json({ error: "domain_not_allowed", reply: "This assistant isn't available on this website." }, 403);
          }
        }

        // 2) Password gate — only enforced if enabled AND a password is set.
        if (agent.password_enabled) {
          const { data: access } = await admin
            .from("agent_access")
            .select("password_hash")
            .eq("agent_id", agentId)
            .maybeSingle();
          const hash = access?.password_hash ?? "";
          if (hash) {
            const supplied = typeof password === "string" && password ? await sha256Hex(password) : "";
            if (supplied !== hash) {
              // Throttle brute-force: count genuine wrong-password attempts per
              // IP per agent and lock out after MAX_PW_ATTEMPTS for the window.
              if (typeof password === "string" && password) {
                const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
                const { data: fails } = await admin.rpc("bump_rate_limit", {
                  p_agent_id: agentId,
                  p_client_id: ip + "|pwfail",
                  p_window_seconds: 3600,
                });
                if (typeof fails === "number" && fails > MAX_PW_ATTEMPTS) {
                  return json(
                    { error: "too_many_attempts", reply: "Too many incorrect attempts. Please try again later." },
                    429,
                  );
                }
              }
              return json(
                { error: "password_required", reply: "🔒 This assistant is password-protected. Please enter the password to continue." },
                401,
              );
            }
          }
        }
      }

      // Lightweight gate check used by the widget to unlock before chatting.
      // Reaches here only after domain + password passed, so it's always valid.
      if (verifyOnly) return json({ ok: true });

      // Rate limiting — protects the owner's LLM spend from abuse/bots.
      // On by default (only an explicit `false` disables it). Skipped for the
      // owner's own Live-Test chats (test:true). Keyed by visitor IP + agent.
      // Free is ALWAYS rate-limited (replies burn the platform key); starter may
      // toggle it but keeps the default limit; only growth can customise the limit.
      const rateLimitOn = plan === "free" || agent.rate_limit_enabled !== false;
      if (rateLimitOn && !test) {
        const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
        const { data: hits } = await admin.rpc("bump_rate_limit", {
          p_agent_id: agentId,
          p_client_id: ip,
          p_window_seconds: 3600,
        });
        const limit =
          plan === "growth" && Number(agent.rate_limit_per_hour) > 0
            ? Number(agent.rate_limit_per_hour)
            : RATE_LIMIT_PER_HOUR;
        if (typeof hits === "number" && hits > limit) {
          return json(
            { reply: "You've reached the message limit for now — please try again later. 🙏", error: "rate_limited", conversationId: null },
            429,
          );
        }
      }

      // RAG retrieval for the latest user question
      const lastUser = [...messages].reverse().find((m: Msg) => m.role === "user");
      let context = "";
      if (lastUser?.content) {
        try {
          const qEmb = await embed(lastUser.content);
          // Hybrid retrieval: semantic (vector) + lexical (full-text), fused via
          // RRF — so exact keywords AND paraphrases both hit. Falls back to the
          // pure-vector RPC if the hybrid migration isn't deployed yet.
          let chunks: { content: string }[] | null = null;
          const hybrid = await admin.rpc("match_agent_chunks_hybrid", {
            p_agent_id: agentId,
            p_query_embedding: qEmb,
            p_query_text: lastUser.content,
            p_match_count: 6,
          });
          if (hybrid.error) {
            const fallback = await admin.rpc("match_agent_chunks", {
              p_agent_id: agentId,
              p_query_embedding: qEmb,
              p_match_count: 6,
            });
            chunks = fallback.data;
          } else {
            chunks = hybrid.data;
          }
          if (chunks?.length) context = chunks.map((c: { content: string }) => c.content).join("\n---\n");
        } catch (_e) {
          // retrieval failure shouldn't break chat
        }
      }

      // Free plan: 50 messages/month on Osciva's platform key, then a friendly stop.
      if (plan === "free") {
        const { data: used } = await admin.rpc("get_monthly_usage", {
          p_user_id: agent.user_id,
          p_month: monthKey(),
        });
        if (typeof used === "number" && used >= FREE_MONTHLY_MSGS) {
          return json({
            reply:
              "This assistant has used all of its free messages for this month. 🙏 " +
              "The site owner can upgrade their Osciva AI plan for unlimited messages.",
            error: "plan_limit",
            conversationId: null,
          });
        }
      }

      // Plan-aware model + key: free is locked to the platform's gpt-4o-mini,
      // starter is clamped to budget models, growth runs whatever is configured.
      const effModel = plan === "free" ? FREE_MODEL : plan === "starter" ? clampStarterModel(agent.model) : agent.model;
      const provider = detectProvider(effModel);
      let apiKey = "";
      if (plan === "free" && PLATFORM_FREE_KEY) {
        apiKey = PLATFORM_FREE_KEY;
      } else {
        // Owner's own key for this model's provider (also the free-tier fallback
        // when no platform key is configured).
        const { data: keyRow } = await admin
          .from("user_api_keys")
          .select("api_key")
          .eq("user_id", agent.user_id)
          .eq("provider", provider)
          .maybeSingle();
        apiKey = keyRow?.api_key ?? "";
      }

      const gate = `⚠️ This assistant isn't ready yet — the owner needs to add their ${provider} API key in Settings → API Keys.`;
      const system = buildSystemPrompt(agent, context);
      const userText = String(lastUser?.content ?? "");
      // Owner Live-Test chats (test:true) are answered but never logged, so they
      // don't inflate the owner's own analytics.
      const conversationId = test ? null : await ensureConversation(agentId, agent.user_id, convIdIn ?? null);
      // A fresh visitor conversation (no incoming id) → notify the owner once.
      if (!test && !convIdIn && conversationId) {
        notifyOwner(
          agent.user_id,
          agentId,
          "chat",
          `💬 New question for ${agent.name ?? "your agent"}`,
          userText ? `A visitor asked: "${userText}"` : "A visitor started a conversation.",
        ).then(() => {}, () => {});
      }
      const countTurn = () => {
        if (!test) admin.rpc("increment_agent_message", { p_agent_id: agentId }).then(() => {}, () => {});
        // Free tier burns the platform key even in Live Test — count every reply.
        if (plan === "free") {
          admin.rpc("bump_monthly_usage", { p_user_id: agent.user_id, p_month: monthKey() }).then(() => {}, () => {});
        }
      };

      // ---- Streaming (SSE) ----
      if (stream) {
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            const finish = () => {
              send({ done: true, conversationId });
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            };
            if (!apiKey) {
              send({ delta: gate });
              finish();
              return;
            }
            let full = "";
            try {
              for await (const delta of streamLLM(provider, effModel, apiKey, system, messages)) {
                full += delta;
                send({ delta });
              }
            } catch (e) {
              if (!full) send({ delta: "Sorry, I'm having trouble responding right now. Please try again in a moment." });
              send({ error: String((e as Error)?.message ?? e) });
            }
            finish();
            countTurn();
            logTurn(conversationId, agentId, userText, full);
          },
        });
        return new Response(body, {
          headers: { ...corsHeaders, "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache" },
        });
      }

      // ---- Non-streaming (JSON) ----
      if (!apiKey) {
        await logTurn(conversationId, agentId, userText, gate);
        return json({ reply: gate, conversationId });
      }

      let reply: string;
      try {
        reply = await callLLM(provider, effModel, apiKey, system, messages);
      } catch (e) {
        return json({
          reply: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
          error: String((e as Error)?.message ?? e),
          conversationId,
        });
      }

      countTurn();
      await logTurn(conversationId, agentId, userText, reply);
      return json({ reply, conversationId });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
