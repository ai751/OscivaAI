// Osciva AI — public product documentation.
// A self-contained docs site (grouped sidebar + content pane) styled to match the
// marketing site. Every section below describes the REAL platform: the dashboard
// flow, the BYOK key model, the embeddable widget, and the live `chat` edge
// function. Keep this in sync with the app — do not document features that aren't
// actually shipped.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Check,
  Search,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";

/* The public chat edge function + widget src. Resolved from the deployment so the
 * docs always show the right URLs (falls back to the production defaults during SSR). */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://ydvzfinuypdjkfnzdpkt.supabase.co";
const CHAT_FN = `${SUPABASE_URL}/functions/v1/chat`;
const APP_ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://app.osciva.io";
const WIDGET_SRC = `${APP_ORIGIN}/osciva-chat.js`;

const C = {
  ink: "var(--mx-ink)",
  sub: "var(--mx-mute)",
  mute: "var(--mx-faint)",
  line: "var(--mx-border)",
  soft: "var(--mx-surface)",
  brand: "#ef785b",
} as const;

/* ----------------------------------------------------------------------------
 * Small presentational primitives (kept local so the docs are self-contained).
 * ------------------------------------------------------------------------- */

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="display text-[30px] sm:text-[36px] font-extrabold text-[color:var(--mx-ink)] tracking-[-0.02em]">{children}</h1>;
}
function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--mx-mute)]">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 mb-3 text-[21px] font-bold text-[color:var(--mx-ink)] tracking-[-0.01em] scroll-mt-24">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-7 mb-2 text-[15px] font-bold text-[color:var(--mx-ink)]">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[14.5px] leading-[1.75] text-[color:var(--mx-sub)]">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 space-y-2">{children}</ul>;
}
function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[14.5px] leading-[1.7] text-[color:var(--mx-sub)]">
      <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-[#ef785b] shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-[5px] bg-[var(--mx-surface)] border border-[var(--mx-border)] text-[12.5px] font-mono text-[#e05f40] break-words">
      {children}
    </code>
  );
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#ef785b] font-medium hover:underline">
      {children}
    </a>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-[#1c2130] bg-[#111827]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-medium text-white/45">{label ?? "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] font-medium text-white/55 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-[#3ECF8E]" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3.5 overflow-x-auto text-[12.5px] leading-[1.7] font-mono text-[#d6dbe6] whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function Note({ type = "info", children }: { type?: "info" | "warn" | "tip"; children: React.ReactNode }) {
  const map = {
    info: { Icon: Info, bg: "#F0F6FF", bd: "#D6E6FF", fg: "#2563EB" },
    warn: { Icon: AlertTriangle, bg: "#FFF6EC", bd: "#FFE2C2", fg: "#B45309" },
    tip: { Icon: Lightbulb, bg: "#F0FBF4", bd: "#CBEFD7", fg: "#16A34A" },
  } as const;
  const { Icon, bg, bd, fg } = map[type];
  return (
    <div className="mt-4 flex gap-3 rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
      <Icon size={17} style={{ color: fg }} className="shrink-0 mt-0.5" />
      <div className="text-[13.5px] leading-relaxed text-[color:var(--mx-sub)] min-w-0">{children}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--mx-border)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--mx-surface)]">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 text-[12px] font-bold text-[color:var(--mx-ink)] border-b border-[var(--mx-border)] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-[13px] leading-relaxed text-[color:var(--mx-sub)] border-b border-[var(--mx-surface)]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Steps({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="mt-5 space-y-5">
      {items.map((s, i) => (
        <li key={i} className="flex gap-4">
          <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-[var(--mx-ink)] text-[color:var(--mx-card)] text-[12px] font-bold">
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <div className="text-[14.5px] font-bold text-[color:var(--mx-ink)]">{s.title}</div>
            <div className="mt-1 text-[14px] leading-[1.7] text-[color:var(--mx-sub)]">{s.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------------------
 * Navigation model.
 * ------------------------------------------------------------------------- */

type Item = { id: string; label: string };
type Group = { title: string; items: Item[] };

const NAV: Group[] = [
  {
    title: "Getting started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
      { id: "concepts", label: "Core concepts" },
    ],
  },
  {
    title: "Build your agent",
    items: [
      { id: "create-agent", label: "Create an agent" },
      { id: "models", label: "Choose a model" },
      { id: "instructions", label: "System instructions" },
      { id: "knowledge-base", label: "Knowledge base (RAG)" },
      { id: "appearance", label: "Appearance" },
      { id: "rate-limiting", label: "Rate limiting" },
      { id: "password", label: "Password protection" },
      { id: "domains", label: "Domain whitelist" },
    ],
  },
  {
    title: "Connect AI (BYOK)",
    items: [
      { id: "api-keys", label: "Add your provider key" },
      { id: "providers", label: "Providers & models" },
      { id: "key-security", label: "How keys are kept safe" },
    ],
  },
  {
    title: "Deploy",
    items: [
      { id: "embed", label: "Embed the widget" },
      { id: "widget-config", label: "Widget configuration" },
      { id: "live-test", label: "Test your agent" },
    ],
  },
  {
    title: "API reference",
    items: [
      { id: "api-overview", label: "Overview" },
      { id: "api-config", label: "GET widget config" },
      { id: "api-chat", label: "POST chat" },
      { id: "api-streaming", label: "Streaming (SSE)" },
      { id: "api-errors", label: "Errors & limits" },
    ],
  },
  {
    title: "Operate",
    items: [
      { id: "analytics", label: "Analytics & conversations" },
      { id: "faq", label: "FAQ" },
      { id: "troubleshooting", label: "Troubleshooting" },
    ],
  },
];

const FLAT: Item[] = NAV.flatMap((g) => g.items);

/* ----------------------------------------------------------------------------
 * Content for each section.
 * ------------------------------------------------------------------------- */

const CONTENT: Record<string, React.ReactNode> = {
  introduction: (
    <>
      <H1>Introduction</H1>
      <Lead>
        Osciva AI is a no-code platform to build, train, and deploy AI agents on your own data. Upload your documents
        or website, pick any AI model, customise the chat widget, and embed it on any site with a single line of code.
      </Lead>

      <H2>What makes Osciva different</H2>
      <P>
        Osciva is <strong>bring-your-own-key (BYOK)</strong> and multi-provider. You connect your own LLM key from
        OpenAI, Anthropic, Google, or OpenRouter, and your agent answers using whichever model you choose — there's no
        forced model and no token markup. Every other platform in this category locks you to one hosted model; Osciva
        lets you pick the best (or cheapest) model for the job.
      </P>
      <UL>
        <LI><strong>Real RAG</strong> — answers are grounded in your uploaded content using hybrid (semantic + keyword) search, so the agent doesn't hallucinate.</LI>
        <LI><strong>Any model</strong> — GPT, Claude, Gemini, or open-source models (Llama, DeepSeek, Mistral, Qwen…) via OpenRouter.</LI>
        <LI><strong>Your key, server-side</strong> — your provider key is stored on the server and never exposed to website visitors.</LI>
        <LI><strong>One-line embed</strong> — a self-contained widget (Shadow DOM) that drops onto any website and streams replies in real time.</LI>
      </UL>

      <H2>How it fits together</H2>
      <Steps
        items={[
          { title: "Create an agent", body: <>Give it a name, choose a model, write its behaviour (system instructions), and pick a personality.</> },
          { title: "Add knowledge", body: <>Upload PDFs / DOCX / TXT files or add website URLs. Osciva chunks and embeds them into a private vector index.</> },
          { title: "Connect your key", body: <>Paste your provider API key once in <Code>Settings → API Keys</Code>. It's stored securely server-side.</> },
          { title: "Embed & go live", body: <>Copy the snippet from the Embed page and paste it into your site. Visitors get instant, grounded answers.</> },
        ]}
      />

      <Note type="tip">
        New here? Jump straight to the <strong>Quickstart</strong> for the fastest path from zero to a live agent.
      </Note>
    </>
  ),

  quickstart: (
    <>
      <H1>Quickstart</H1>
      <Lead>Go from nothing to a live, embedded AI agent in about five minutes.</Lead>

      <Steps
        items={[
          {
            title: "Sign up and open the dashboard",
            body: <>Create your account, then open <Code>Dashboard → Agents</Code> and click <strong>Create Agent</strong>.</>,
          },
          {
            title: "Configure the agent (General tab)",
            body: (
              <>
                Enter a name, click <strong>Choose a model</strong>, and write <strong>System Instructions</strong> — or
                pick an industry template (Education, Healthcare, E-commerce, General) and fill in the{" "}
                <Code>[BRACKETS]</Code>. Choose a personality tone.
              </>
            ),
          },
          {
            title: "Add your knowledge (Knowledge Base tab)",
            body: <>Upload documents (PDF, DOCX, TXT) or add website URLs. Osciva automatically indexes them for retrieval.</>,
          },
          {
            title: "Connect your AI key",
            body: (
              <>
                Go to <Code>Settings → API Keys</Code> and paste a key for the provider your model uses (e.g. OpenAI for
                a GPT model). Until a matching key exists, the agent will politely say it isn't ready yet.
              </>
            ),
          },
          {
            title: "Test it",
            body: <>Open the <Code>Embed</Code> page and use the <strong>Live Test Chat</strong> — it talks to the real backend and your knowledge base, exactly like a visitor would.</>,
          },
          {
            title: "Embed on your site",
            body: <>Copy the HTML snippet from the Embed page and paste it before <Code>{"</body>"}</Code> on your website. That's it — the chat bubble appears.</>,
          },
        ]}
      />

      <H2>The minimal embed snippet</H2>
      <CodeBlock
        label="index.html"
        code={`<!-- Osciva AI Chat Widget -->
<script src="${WIDGET_SRC}"
  data-agent-id="YOUR_AGENT_ID"
  data-api="${CHAT_FN}"></script>`}
      />
      <Note type="info">
        Find your <strong>Agent ID</strong> on the Embed page (there's a one-click copy button). The snippet shown there
        is pre-filled with your real agent ID and endpoint.
      </Note>
    </>
  ),

  concepts: (
    <>
      <H1>Core concepts</H1>
      <Lead>A quick glossary of the building blocks you'll work with.</Lead>

      <H3>Agent</H3>
      <P>
        A single AI assistant with its own model, system instructions, personality, knowledge base, appearance, and
        embed snippet. You can run multiple agents (e.g. one for support, one for sales), each fully isolated.
      </P>

      <H3>Knowledge base (RAG)</H3>
      <P>
        The documents and URLs you attach to an agent. Osciva splits them into chunks, embeds each chunk into a vector,
        and retrieves the most relevant pieces at question time — this is <strong>Retrieval-Augmented Generation</strong>.
        It keeps answers grounded in your real content. See <Code>Knowledge base (RAG)</Code>.
      </P>

      <H3>BYOK (bring your own key)</H3>
      <P>
        Your agent answers using <em>your</em> LLM provider key. You pay your provider directly (no token markup), and
        you choose the model. Keys are stored server-side and never sent to the browser widget.
      </P>

      <H3>Provider &amp; model</H3>
      <P>
        The model you pick (e.g. <Code>gpt-4o</Code>, <Code>claude-sonnet-4-6</Code>, <Code>gemini-2.5-flash</Code>)
        determines the provider (OpenAI / Anthropic / Google AI / OpenRouter). Osciva detects the provider from the
        model id and uses the matching key.
      </P>

      <H3>Widget</H3>
      <P>
        The embeddable chat bubble (<Code>osciva-chat.js</Code>). It's a self-contained script that renders inside a
        Shadow DOM, so it never clashes with your site's CSS. It pulls the agent's look from the backend and streams
        replies token-by-token.
      </P>

      <H3>Conversation</H3>
      <P>
        A visitor chat session. Every real visitor conversation is logged (with transcripts) for your Analytics. Your
        own Live Test chats are answered but never logged, so they don't pollute your numbers.
      </P>
    </>
  ),

  "create-agent": (
    <>
      <H1>Create an agent</H1>
      <Lead>
        Agents are built in a five-tab wizard: <strong>General</strong>, <strong>Knowledge Base</strong>,{" "}
        <strong>Appearance</strong>, <strong>Security</strong>, and <strong>Preview</strong>.
      </Lead>

      <H2>General tab</H2>
      <UL>
        <LI><strong>Name</strong> — shown in your dashboard and (by default) in the widget header.</LI>
        <LI><strong>AI model</strong> — click <em>Choose a model</em> to open the picker (search + filter by provider). See <Code>Choose a model</Code>.</LI>
        <LI><strong>System instructions</strong> — the agent's behaviour spec. Click the field to open the full-screen editor, or start from an industry template. See <Code>System instructions</Code>.</LI>
        <LI><strong>Personality</strong> — a tone preset applied on top of your instructions.</LI>
      </UL>

      <H3>Personality presets</H3>
      <Table
        head={["Preset", "Tone"]}
        rows={[
          ["Professional", "Formal, precise"],
          ["Friendly", "Warm and approachable"],
          ["Concise", "Brief and to the point"],
          ["Expert", "Deep domain authority"],
          ["Empathetic", "Understanding and caring"],
          ["Playful", "Fun and engaging"],
        ].map((r) => r.map((c) => <span key={c as string}>{c}</span>))}
      />

      <H2>Saving &amp; editing</H2>
      <P>
        Click <strong>Save</strong> to create the agent. When you add or change knowledge, Osciva automatically
        re-indexes (embeds) the new content in the background. You can re-open any agent from the Agents list to edit
        every setting later.
      </P>
      <Note type="info">
        An agent must be <strong>active</strong> to answer. The widget and API return <Code>Agent not found</Code> (404)
        for inactive or missing agents.
      </Note>
    </>
  ),

  models: (
    <>
      <H1>Choose a model</H1>
      <Lead>
        Osciva is multi-provider. The model id you pick decides the provider, and your matching{" "}
        <Code>Settings → API Keys</Code> entry is used to call it.
      </Lead>

      <H2>OpenAI</H2>
      <Table
        head={["Model id", "Notes"]}
        rows={[
          [<Code>gpt-4o</Code>, "Flagship · vision + text"],
          [<Code>gpt-4o-mini</Code>, "Fast & affordable"],
          [<Code>gpt-4.1</Code>, "Smartest GPT-4 class"],
          [<Code>gpt-4.1-mini</Code>, "Balanced speed / cost"],
          [<Code>gpt-4.1-nano</Code>, "Cheapest, fastest"],
          [<Code>gpt-4-turbo</Code>, "Previous flagship"],
          [<Code>o4-mini</Code>, "Reasoning · efficient"],
          [<Code>o3</Code>, "Deep reasoning"],
        ]}
      />

      <H2>Anthropic (Claude)</H2>
      <Table
        head={["Model id", "Notes"]}
        rows={[
          [<Code>claude-fable-5</Code>, "Most capable"],
          [<Code>claude-opus-4-8</Code>, "Top-tier reasoning"],
          [<Code>claude-opus-4-7</Code>, "Highly capable Opus"],
          [<Code>claude-sonnet-4-6</Code>, "Best speed / intelligence"],
          [<Code>claude-haiku-4-5</Code>, "Fastest, most affordable"],
        ]}
      />

      <H2>Google (Gemini)</H2>
      <Table
        head={["Model id", "Notes"]}
        rows={[
          [<Code>gemini-2.5-pro</Code>, "Advanced reasoning"],
          [<Code>gemini-2.5-flash</Code>, "Fast & smart"],
          [<Code>gemini-2.0-flash</Code>, "Google's fastest"],
          [<Code>gemini-2.0-flash-lite</Code>, "Lightest & cheapest"],
        ]}
      />

      <H2>OpenRouter (open-source &amp; more)</H2>
      <P>
        OpenRouter is a gateway to many models with one key. Pick a preset or choose <strong>Custom model…</strong> and
        paste any slug from <A href="https://openrouter.ai/models">openrouter.ai/models</A>.
      </P>
      <Table
        head={["Model id", "Notes"]}
        rows={[
          [<Code>meta-llama/llama-3.3-70b-instruct</Code>, "Meta · open-source flagship"],
          [<Code>deepseek/deepseek-chat</Code>, "DeepSeek V3 · cheap & smart"],
          [<Code>deepseek/deepseek-r1</Code>, "DeepSeek · reasoning"],
          [<Code>mistralai/mistral-large</Code>, "Mistral · strong reasoning"],
          [<Code>qwen/qwen-2.5-72b-instruct</Code>, "Alibaba · multilingual"],
          [<Code>x-ai/grok-2</Code>, "xAI · conversational"],
          [<Code>openrouter/auto</Code>, "Auto-route to the best model"],
        ]}
      />

      <H2>Legacy aliases</H2>
      <P>Friendly aliases map to current models, so older agents keep working:</P>
      <Table
        head={["Alias", "Resolves to"]}
        rows={[
          [<Code>claude-sonnet</Code>, <Code>claude-sonnet-4-6</Code>],
          [<Code>claude-haiku</Code>, <Code>claude-haiku-4-5</Code>],
          [<Code>claude-opus</Code>, <Code>claude-opus-4-8</Code>],
          [<Code>gemini-flash</Code>, <Code>gemini-2.0-flash</Code>],
          [<Code>gemini-pro</Code>, <Code>gemini-2.5-pro</Code>],
        ]}
      />
      <Note type="warn">
        Whichever model you choose, make sure you've added that provider's key in{" "}
        <Code>Settings → API Keys</Code>. A GPT model needs an OpenAI key, a Claude model needs an Anthropic key, and so on.
      </Note>
    </>
  ),

  instructions: (
    <>
      <H1>System instructions</H1>
      <Lead>
        System instructions are the rules that shape how your agent behaves — its role, tone, boundaries, and any
        step-by-step logic. They are the single most important setting for answer quality.
      </Lead>

      <H2>How instructions are used</H2>
      <P>
        At answer time, Osciva builds a system prompt that places your instructions in a fenced{" "}
        <strong>OPERATING INSTRUCTIONS</strong> block, explicitly marked as authoritative. The model is told to follow
        them exactly and in full — they take priority over Osciva's generic defaults. Your knowledge base is then
        attached as the source of facts.
      </P>

      <H2>Anatomy of a good prompt</H2>
      <CodeBlock
        label="system-instructions"
        code={`You are a support agent for [Company].          // Role
Your tone is professional yet friendly.         // Personality
You only answer questions about our products.   // Boundaries
If unsure, offer to connect the user to a human.// Fallback
Always answer from the knowledge base.          // Behaviour`}
      />

      <H2>Industry templates</H2>
      <P>
        Don't want to write a prompt from scratch? In the editor, click a template to load a production-grade starting
        point, then replace everything in <Code>[SQUARE BRACKETS]</Code>:
      </P>
      <UL>
        <LI><strong>🎓 Education</strong> — schools, colleges, coaching & ed-tech.</LI>
        <LI><strong>🏥 Healthcare</strong> — hospitals, clinics & diagnostics (includes an emergency-first rule and a no-medical-advice boundary).</LI>
        <LI><strong>🛒 E-commerce</strong> — online stores, D2C & retail (order, shipping, returns handling).</LI>
        <LI><strong>💼 General Business</strong> — services, agencies, SaaS & local businesses.</LI>
      </UL>
      <Note type="tip">
        Put <strong>behaviour</strong> in the instructions and <strong>facts</strong> (courses, prices, doctors,
        products, policies) in the Knowledge Base. The templates are built around this split.
      </Note>

      <H2>AI refine</H2>
      <P>
        The editor includes an AI helper that rewrites your draft into a cleaner, more structured prompt using your
        selected model and key. Use it to tidy up a rough first pass.
      </P>
    </>
  ),

  "knowledge-base": (
    <>
      <H1>Knowledge base (RAG)</H1>
      <Lead>
        The knowledge base is what makes answers accurate. Osciva retrieves the most relevant pieces of your content for
        each question and feeds them to the model.
      </Lead>

      <H2>Supported sources</H2>
      <Table
        head={["Source", "How to add"]}
        rows={[
          ["PDF", "Upload in the Knowledge Base tab"],
          ["DOCX", "Upload in the Knowledge Base tab"],
          ["TXT", "Upload in the Knowledge Base tab"],
          ["Website URL", "Paste a URL — Osciva fetches the clean, rendered text"],
        ]}
      />
      <Note type="info">
        URL ingestion uses a reader that returns clean, JS-rendered text and strips site navigation, headers, and
        footers, so menus and boilerplate don't pollute your knowledge base.
      </Note>

      <H2>How indexing works</H2>
      <Steps
        items={[
          { title: "Chunking", body: <>Your content is split into sentence-aware chunks (~180 words with ~30 words of overlap) so related context stays together.</> },
          { title: "Embedding", body: <>Each chunk is converted to a 384-dimension vector using a built-in embedding model. This is free — it doesn't use your LLM key.</> },
          { title: "Storage", body: <>Vectors are stored in a private, per-agent index. One agent can never read another's content.</> },
        ]}
      />

      <H2>How retrieval works</H2>
      <P>
        Osciva uses <strong>hybrid retrieval</strong>: it combines semantic (vector) search with lexical (full-text
        keyword) search and fuses the results using Reciprocal Rank Fusion. This means both paraphrased questions{" "}
        <em>and</em> exact keywords (SKUs, acronyms, names) reliably surface the right chunk. The top matches are
        injected into the prompt as the source of facts.
      </P>

      <H2>Re-indexing</H2>
      <P>
        When you add, change, or remove sources and save, Osciva automatically re-embeds what changed. New chunking and
        retrieval improvements apply to content on its next upload or re-index.
      </P>
      <Note type="warn">
        If the agent says it has no information, confirm the documents finished indexing and that your question matches
        the content. Scanned/image-only PDFs (no extractable text) can't be indexed.
      </Note>
    </>
  ),

  appearance: (
    <>
      <H1>Appearance</H1>
      <Lead>Control how the widget looks and what it says before a visitor types anything.</Lead>

      <H2>Settings (Appearance tab)</H2>
      <Table
        head={["Setting", "Description"]}
        rows={[
          ["Welcome message", "The first message the bot shows when the chat opens."],
          ["Suggestions", "Up to 4 quick-reply chips shown under the welcome message."],
          ["Position", "Which corner the bubble sits in — left or right."],
          ["Logo URL", "A logo shown in the widget header (your brand)."],
        ]}
      />

      <H2>What the widget pulls automatically</H2>
      <P>
        When a page loads the widget with just a <Code>data-agent-id</Code>, it fetches the agent's name, welcome
        message, logo, colour, position, and suggestions from the backend. You don't have to hard-code any of it.
      </P>
      <Note type="tip">
        The header logo is your per-agent brand logo. The floating bubble icon is always the universal Osciva logo —
        that's by design. You can still override the header logo per embed (see Widget configuration).
      </Note>
    </>
  ),

  "rate-limiting": (
    <>
      <H1>Rate limiting</H1>
      <Lead>
        Rate limiting protects your LLM spend from abuse and bots. It's enforced server-side, <em>before</em> any model
        call, so blocked requests cost you nothing.
      </Lead>

      <H2>Defaults</H2>
      <UL>
        <LI><strong>On by default</strong> — every agent is rate-limited unless you explicitly turn it off.</LI>
        <LI><strong>20 messages per visitor per hour</strong> by default, configurable per agent (1–1000).</LI>
        <LI>Counted per visitor IP, per agent, in a rolling 1-hour window.</LI>
        <LI>Your own <strong>Live Test</strong> chats are never rate-limited.</LI>
      </UL>

      <H2>Configure it</H2>
      <P>
        Open the agent's <strong>Security</strong> tab. Toggle <strong>Rate Limiting</strong> and set{" "}
        <strong>Messages per visitor / hour</strong>. A visitor who exceeds the limit gets a friendly "try again later"
        message instead of an answer.
      </P>

      <H2>What a blocked visitor sees</H2>
      <CodeBlock
        label="HTTP 429"
        code={`{
  "reply": "You've reached the message limit for now — please try again later. 🙏",
  "error": "rate_limited",
  "conversationId": null
}`}
      />
    </>
  ),

  password: (
    <>
      <H1>Password protection</H1>
      <Lead>
        Lock an agent behind a password so only people you share it with can chat — useful for internal tools, staging,
        or paid/members-only assistants.
      </Lead>

      <H2>Enable it</H2>
      <Steps
        items={[
          { title: "Open the Security tab", body: <>Edit the agent and go to <strong>Security</strong>.</> },
          { title: "Turn on Password Protection", body: <>Toggle it on and enter a password. When editing later, leave the field blank to keep the current password.</> },
          { title: "Save", body: <>Visitors now see a password screen before they can chat.</> },
        ]}
      />

      <H2>How it works</H2>
      <UL>
        <LI>Your password is hashed (SHA-256) in your browser before it's saved — plaintext never leaves your device.</LI>
        <LI>The hash is stored in a private, owner-only table that visitors and the widget can never read.</LI>
        <LI>The widget shows a lock screen; once a visitor enters the correct password it's remembered for their browser session.</LI>
        <LI>Enforcement happens server-side <em>before</em> any model call, so locked agents cost you nothing for blocked attempts.</LI>
        <LI>Brute-force is throttled: after 10 wrong attempts in an hour, that visitor is temporarily locked out.</LI>
      </UL>
      <Note type="info">
        Calling the API directly? Include <Code>{`"password": "…"`}</Code> in your POST body. A missing or wrong
        password returns <Code>401</Code> with <Code>{`"error": "password_required"`}</Code>.
      </Note>
    </>
  ),

  domains: (
    <>
      <H1>Domain whitelist</H1>
      <Lead>
        Restrict which websites are allowed to embed and use an agent. With a whitelist set, requests from any other
        site are rejected.
      </Lead>

      <H2>Set it up</H2>
      <Steps
        items={[
          { title: "Open the Security tab", body: <>Edit the agent and go to <strong>Security</strong>.</> },
          { title: "Add your domains", body: <>Under <strong>Domain Whitelist</strong>, type a domain and press Enter. Add as many as you need.</> },
          { title: "Save", body: <>Only the listed domains (and their subdomains) can now use the agent.</> },
        ]}
      />

      <H2>What counts as a match</H2>
      <UL>
        <LI>Enter the bare domain, e.g. <Code>example.com</Code> — <Code>https://</Code>, <Code>www.</Code>, and paths are ignored.</LI>
        <LI>Subdomains are allowed automatically: <Code>example.com</Code> also permits <Code>shop.example.com</Code>.</LI>
        <LI>An empty whitelist means the agent works on any site (the default).</LI>
      </UL>
      <Note type="warn">
        The check uses the browser's <Code>Origin</Code> / <Code>Referer</Code>. A non-browser (server-to-server) call
        with a whitelist set has no origin and is blocked. Blocked requests return <Code>403</Code> with{" "}
        <Code>{`"error": "domain_not_allowed"`}</Code>.
      </Note>
      <Note type="info">
        Your dashboard <strong>Live Test</strong> always works regardless of the whitelist, so you can keep testing.
      </Note>
    </>
  ),

  "api-keys": (
    <>
      <H1>Add your provider key</H1>
      <Lead>
        Osciva is bring-your-own-key. Add a key once for each provider you plan to use, in{" "}
        <Code>Settings → API Keys</Code>.
      </Lead>

      <H2>Where to get a key</H2>
      <Table
        head={["Provider", "Get your key"]}
        rows={[
          ["OpenAI", <A href="https://platform.openai.com/api-keys">platform.openai.com/api-keys</A>],
          ["Anthropic", <A href="https://console.anthropic.com/settings/keys">console.anthropic.com/settings/keys</A>],
          ["Google AI", <A href="https://aistudio.google.com/apikey">aistudio.google.com/apikey</A>],
          ["OpenRouter", <A href="https://openrouter.ai/keys">openrouter.ai/keys</A>],
        ]}
      />

      <H2>Add it</H2>
      <Steps
        items={[
          { title: "Open API Keys", body: <>Go to <Code>Settings → API Keys</Code>.</> },
          { title: "Paste the key", body: <>Find your provider card, paste the key, and click <strong>Save</strong>. The card shows <strong>Connected</strong> and a masked preview.</> },
          { title: "Match the model", body: <>Make sure your agent's model belongs to a provider you've connected — e.g. a Claude model needs the Anthropic key.</> },
        ]}
      />

      <Note type="warn">
        If a visitor messages an agent whose provider has no key, the agent replies:{" "}
        <em>"This assistant isn't ready yet — the owner needs to add their [Provider] API key in Settings → API Keys."</em>{" "}
        Add the key to fix it instantly.
      </Note>

      <H2>You only need one key for chat</H2>
      <P>
        Embeddings (used for RAG) run on a free built-in model, so they need no key. The only key required is the one
        for your chat model's provider.
      </P>
    </>
  ),

  providers: (
    <>
      <H1>Providers &amp; models</H1>
      <Lead>Osciva auto-detects the provider from your model id and uses the matching key.</Lead>
      <Table
        head={["Provider", "Detected from", "Example models"]}
        rows={[
          ["OpenAI", <>id starts with <Code>gpt</Code> / <Code>openai</Code></>, <>GPT-4o, GPT-4.1, o3</>],
          ["Anthropic", <>id starts with <Code>claude</Code></>, <>Claude Sonnet 4.6, Opus 4.8</>],
          ["Google AI", <>id starts with <Code>gemini</Code></>, <>Gemini 2.5 Pro / Flash</>],
          ["OpenRouter", <>id contains a <Code>/</Code> (vendor slug)</>, <>Llama, DeepSeek, Mistral, Qwen, Grok</>],
        ]}
      />
      <P>
        For the full model list per provider, see <Code>Choose a model</Code>. For where to obtain keys, see{" "}
        <Code>Add your provider key</Code>.
      </P>
      <Note type="tip">
        The BYOK model means no token markup — you pay your provider directly at their rates, and you can switch models
        anytime by editing the agent.
      </Note>
    </>
  ),

  "key-security": (
    <>
      <H1>How keys are kept safe</H1>
      <Lead>Your provider key is a server-side secret. Website visitors never see it.</Lead>
      <UL>
        <LI><strong>Stored server-side</strong> — keys are saved to your account on the server, scoped to you with row-level security.</LI>
        <LI><strong>Used only at answer time</strong> — when a visitor asks a question, the backend looks up your key, calls your chosen provider, and returns only the answer.</LI>
        <LI><strong>Never sent to the browser</strong> — the embeddable widget never receives the key. It only ever sees the agent id and the reply text.</LI>
        <LI><strong>Masked in the dashboard</strong> — once saved, only a short preview (first 6 / last 4 characters) is shown.</LI>
      </UL>
      <Note type="info">
        Because it's your own key on your own provider account, you keep full control: rotate or revoke it anytime from
        your provider's console, and you set your own usage limits there.
      </Note>
    </>
  ),

  embed: (
    <>
      <H1>Embed the widget</H1>
      <Lead>
        Add your agent to any website with one script tag. The widget is self-contained and isolated in a Shadow DOM, so
        it won't conflict with your site's styles.
      </Lead>

      <H2>HTML (any site)</H2>
      <P>Paste this just before the closing <Code>{"</body>"}</Code> tag:</P>
      <CodeBlock
        label="HTML"
        code={`<!-- Osciva AI Chat Widget -->
<script src="${WIDGET_SRC}"
  data-agent-id="YOUR_AGENT_ID"
  data-api="${CHAT_FN}"></script>`}
      />
      <P>
        It's a single script tag, so it works the same way on any host that lets you add HTML — a static site, a CMS, or a
        framework like React, Vue, or WordPress. Add it to a global template/footer to load it site-wide, or to one page's
        HTML to scope it there.
      </P>

      <H2>Attributes</H2>
      <Table
        head={["Attribute", "Required", "Description"]}
        rows={[
          [<Code>data-agent-id</Code>, "Yes", "Your Osciva agent ID (from the Embed page)."],
          [<Code>data-api</Code>, "No", <>The chat endpoint. Pre-filled; leave as-is unless self-hosting.</>],
        ]}
      />
      <Note type="tip">
        The Embed page in your dashboard generates these snippets pre-filled with your real agent ID, plus a one-click
        copy. Use that instead of hand-editing.
      </Note>
    </>
  ),

  "widget-config": (
    <>
      <H1>Widget configuration</H1>
      <Lead>
        For most sites, <Code>data-agent-id</Code> is enough — the widget pulls everything else from the agent. To
        override any value per page, define <Code>window.OscivaConfig</Code> <strong>before</strong> the script tag.
      </Lead>

      <CodeBlock
        label="HTML"
        code={`<script>
  window.OscivaConfig = {
    agentId: "YOUR_AGENT_ID",            // or use data-agent-id
    companyName: "Adya Hospital",        // header title
    tagline: "🏥 24/7 Care",            // header subtitle
    welcomeMessage: "Hi there! 👋",      // first bot message
    headerLogo: "https://site.com/logo.png",
    color: "#111827",                    // header / accent colour
    position: "right",                   // "left" or "right"
    suggestions: ["Book appointment", "Find a doctor"],
    bubbleMessages: ["Need help? 💬", "Ask me anything 💡"]
  };
</script>
<script src="${WIDGET_SRC}" data-agent-id="YOUR_AGENT_ID"></script>`}
      />

      <H2>Options</H2>
      <Table
        head={["Key", "Type", "Description"]}
        rows={[
          [<Code>agentId</Code>, "string", "Your agent ID (or use the data-agent-id attribute)."],
          [<Code>api</Code>, "string", "Override the chat endpoint."],
          [<Code>companyName</Code>, "string", "Header title. Defaults to the agent's name."],
          [<Code>tagline</Code>, "string", "Small header subtitle."],
          [<Code>welcomeMessage</Code>, "string", "First message shown when chat opens."],
          [<Code>headerLogo</Code>, "string", "Logo URL shown in the header."],
          [<Code>bubbleLogo</Code>, "string", "Icon for the floating button (defaults to Osciva)."],
          [<Code>color</Code>, "string", "Header & accent colour (hex)."],
          [<Code>position</Code>, "string", '"left" or "right".'],
          [<Code>suggestions</Code>, "string[]", "Quick-reply chips (up to 4)."],
          [<Code>bubbleMessages</Code>, "string[]", "Rotating teaser texts above the bubble."],
        ]}
      />
      <Note type="info">
        Precedence: any value you set in <Code>OscivaConfig</Code> wins over the agent's saved settings. Anything you
        leave out falls back to the agent's dashboard configuration.
      </Note>
    </>
  ),

  "live-test": (
    <>
      <H1>Test your agent</H1>
      <Lead>
        Before (or after) embedding, test against the <em>real</em> backend — same model, same knowledge base, same
        retrieval a visitor would get.
      </Lead>
      <H2>Live Test Chat</H2>
      <P>
        Open the <Code>Embed</Code> page and use the <strong>Live Test Chat</strong> panel. It sends your messages to the
        live chat function with a <Code>test</Code> flag, which means:
      </P>
      <UL>
        <LI>It's answered exactly like a production visitor message.</LI>
        <LI>It is <strong>not</strong> logged to Analytics and does <strong>not</strong> count toward usage.</LI>
        <LI>It's never rate-limited, so you can test freely.</LI>
      </UL>
      <Note type="tip">
        If the Live Test says the assistant isn't ready, you haven't added a provider key for the agent's model yet —
        see <Code>Add your provider key</Code>.
      </Note>
    </>
  ),

  "api-overview": (
    <>
      <H1>Chat API — overview</H1>
      <Lead>
        The widget is a thin client over one public endpoint. You can call it directly to build custom integrations.
      </Lead>
      <H2>Base endpoint</H2>
      <CodeBlock label="endpoint" code={CHAT_FN} />
      <Table
        head={["Method", "Purpose"]}
        rows={[
          [<Code>GET</Code>, "Fetch a widget's public display config."],
          [<Code>POST</Code>, "Send messages and get an answer (JSON or streamed)."],
        ]}
      />
      <Note type="info">
        The endpoint is public (no auth header needed) and CORS-enabled, so it can be called from any browser or server.
        The agent owner's LLM key is resolved server-side — it's never part of the request or response.
      </Note>
    </>
  ),

  "api-config": (
    <>
      <H1>GET widget config</H1>
      <Lead>Returns the public display settings for an agent. Used by the widget to render itself.</Lead>
      <CodeBlock label="request" code={`GET ${CHAT_FN}?agentId=YOUR_AGENT_ID`} />
      <H2>Response</H2>
      <CodeBlock
        label="200 OK"
        code={`{
  "name": "Adya Hospital",
  "welcomeMsg": "Hi 👋 How can I help you today?",
  "color": "#111827",
  "position": "right",
  "chatIcon": "🤖",
  "logoUrl": "https://site.com/logo.png",
  "suggestions": ["Book appointment", "Find a doctor"],
  "passwordRequired": false
}`}
      />
      <P>
        If the agent doesn't exist or is inactive, the endpoint returns <Code>404</Code> with{" "}
        <Code>{`{ "error": "Agent not found" }`}</Code>.
      </P>
    </>
  ),

  "api-chat": (
    <>
      <H1>POST chat</H1>
      <Lead>Send the conversation so far and receive the assistant's reply.</Lead>

      <H2>Request body</H2>
      <Table
        head={["Field", "Type", "Description"]}
        rows={[
          [<Code>agentId</Code>, "string", "Required. The agent to talk to."],
          [<Code>messages</Code>, "array", <>Required. Chat history as <Code>{`{ role, content }`}</Code>; <Code>role</Code> is <Code>"user"</Code> or <Code>"assistant"</Code>.</>],
          [<Code>stream</Code>, "boolean", <>Optional. <Code>true</Code> returns a streamed SSE response.</>],
          [<Code>conversationId</Code>, "string", "Optional. Pass the id returned previously to thread a session."],
          [<Code>password</Code>, "string", <>Optional. Required only if the agent is password-protected.</>],
          [<Code>test</Code>, "boolean", "Optional. Owner-only: answered but not logged or counted."],
        ]}
      />

      <H2>Example</H2>
      <CodeBlock
        label="POST (JSON)"
        code={`curl -X POST ${CHAT_FN} \\
  -H "content-type: application/json" \\
  -d '{
    "agentId": "YOUR_AGENT_ID",
    "messages": [
      { "role": "user", "content": "What are your OPD timings?" }
    ]
  }'`}
      />

      <H2>Response</H2>
      <CodeBlock
        label="200 OK"
        code={`{
  "reply": "Our OPD is open Mon–Sat, 8:00 AM – 8:00 PM.",
  "conversationId": "b1f2…"
}`}
      />
      <P>
        Pass the returned <Code>conversationId</Code> back on the next request to keep the turns in one logged session.
        Only the latest user message is used for retrieval; the full history is sent to the model for context.
      </P>
    </>
  ),

  "api-streaming": (
    <>
      <H1>Streaming (SSE)</H1>
      <Lead>
        Add <Code>{`"stream": true`}</Code> to receive the answer token-by-token as Server-Sent Events. This is how the
        widget renders replies live.
      </Lead>

      <CodeBlock
        label="POST (stream)"
        code={`POST ${CHAT_FN}
content-type: application/json

{
  "agentId": "YOUR_AGENT_ID",
  "messages": [{ "role": "user", "content": "Hi" }],
  "stream": true
}`}
      />

      <H2>Event format</H2>
      <P>The response is <Code>text/event-stream</Code>. Each line is an event:</P>
      <CodeBlock
        label="text/event-stream"
        code={`data: {"delta":"Our OPD "}
data: {"delta":"is open "}
data: {"delta":"Mon–Sat."}
data: {"done":true,"conversationId":"b1f2…"}
data: [DONE]`}
      />
      <Table
        head={["Event", "Meaning"]}
        rows={[
          [<Code>{`{"delta":"…"}`}</Code>, "An incremental chunk of text — append it to the message."],
          [<Code>{`{"done":true,"conversationId":"…"}`}</Code>, "Final marker with the session id."],
          [<Code>[DONE]</Code>, "Stream terminator."],
        ]}
      />
      <Note type="tip">
        Clients should fall back to the JSON path if the response isn't <Code>text/event-stream</Code>. The official
        widget does this automatically.
      </Note>
    </>
  ),

  "api-errors": (
    <>
      <H1>Errors &amp; limits</H1>
      <Lead>How the endpoint reports problems, and the limits you should expect.</Lead>

      <H2>Status codes</H2>
      <Table
        head={["Code", "Meaning"]}
        rows={[
          [<Code>200</Code>, "Success (JSON or stream)."],
          [<Code>400</Code>, <>Bad request — missing <Code>agentId</Code> or <Code>messages</Code>.</>],
          [<Code>401</Code>, <>Password required or incorrect (<Code>error: "password_required"</Code>).</>],
          [<Code>403</Code>, <>Domain not allowed by the whitelist (<Code>error: "domain_not_allowed"</Code>).</>],
          [<Code>404</Code>, "Agent not found or inactive."],
          [<Code>429</Code>, "Rate limit exceeded for this visitor."],
          [<Code>405</Code>, "Method not allowed."],
          [<Code>500</Code>, "Unexpected server error."],
        ]}
      />

      <H2>Graceful answers</H2>
      <P>
        Even when the upstream model fails, the endpoint still returns a friendly <Code>reply</Code> (and an{" "}
        <Code>error</Code> field for debugging) rather than breaking the chat. The "owner hasn't added a key" gate is
        also returned as a normal <Code>reply</Code>.
      </P>

      <H2>Rate limit (429)</H2>
      <P>
        Default 20 messages / visitor / hour, per agent (configurable). See <Code>Rate limiting</Code>. Blocked requests
        are rejected before any model call, so they never cost you tokens.
      </P>
    </>
  ),

  analytics: (
    <>
      <H1>Analytics &amp; conversations</H1>
      <Lead>Every real visitor conversation is logged so you can see how your agents perform.</Lead>

      <H2>What's tracked</H2>
      <UL>
        <LI><strong>Conversations</strong> — each visitor session is a conversation, threaded by <Code>conversationId</Code>.</LI>
        <LI><strong>Messages</strong> — every user and assistant turn is stored for full transcripts.</LI>
        <LI><strong>Counts</strong> — message and conversation totals feed your dashboard metrics.</LI>
      </UL>

      <H2>Recent conversations</H2>
      <P>
        The <Code>Analytics</Code> page has a <strong>Recent Conversations</strong> section with expandable transcripts
        of real visitor chats, so you can read exactly what was asked and how your agent answered.
      </P>
      <Note type="info">
        Your own <strong>Live Test</strong> chats are excluded from analytics, so your numbers reflect real visitors
        only.
      </Note>
    </>
  ),

  faq: (
    <>
      <H1>FAQ</H1>

      <H3>Do I need an API key?</H3>
      <P>Yes — one for your chat model's provider. Embeddings for RAG are free and need no key.</P>

      <H3>Can I switch models later?</H3>
      <P>Anytime. Edit the agent and pick a different model; just make sure the matching provider key is connected.</P>

      <H3>Will visitors ever see my key?</H3>
      <P>No. Keys live server-side and are used only to generate answers. The widget only ever receives reply text.</P>

      <H3>Can I run more than one agent?</H3>
      <P>Yes. Each agent has its own model, knowledge base, appearance, and embed snippet, fully isolated from the others.</P>

      <H3>What file types can I upload?</H3>
      <P>PDF, DOCX, and TXT files, plus website URLs. See <Code>Knowledge base (RAG)</Code>.</P>

      <H3>Does the widget work on any website?</H3>
      <P>Yes — it's a single HTML script tag, isolated in a Shadow DOM, so it runs on any site or CMS that lets you add HTML.</P>

      <H3>Is there token markup?</H3>
      <P>No. Because it's bring-your-own-key, you pay your provider directly at their rates.</P>
    </>
  ),

  troubleshooting: (
    <>
      <H1>Troubleshooting</H1>

      <H3>"This assistant isn't ready yet…"</H3>
      <P>
        The agent's model has no matching provider key. Add it in <Code>Settings → API Keys</Code> — e.g. an Anthropic
        key for a Claude model.
      </P>

      <H3>The widget doesn't appear</H3>
      <UL>
        <LI>Confirm the script tag is present and <Code>data-agent-id</Code> is set to a valid agent.</LI>
        <LI>Open the browser console — a missing agent id logs an Osciva error.</LI>
        <LI>Ensure the agent is <strong>active</strong>; inactive agents return 404.</LI>
      </UL>

      <H3>The agent answers "I'm not sure" to known facts</H3>
      <UL>
        <LI>Check the document finished indexing (re-save the agent to re-index).</LI>
        <LI>Image-only / scanned PDFs have no extractable text and can't be indexed.</LI>
        <LI>Try phrasing closer to the source wording, or add the fact explicitly to the knowledge base.</LI>
      </UL>

      <H3>Visitors are getting "message limit" replies</H3>
      <P>
        That's rate limiting. Raise the per-hour cap (or disable it) in the agent's <strong>Security</strong> tab — see{" "}
        <Code>Rate limiting</Code>.
      </P>

      <H3>Replies are slow or cut off</H3>
      <P>
        Response speed depends on your chosen model and provider. Try a faster model (e.g. a "mini" / "flash" / "haiku"
        variant) for snappier replies.
      </P>

      <Note type="info">
        Still stuck? Reach out from the <a href="/contact" className="text-[#ef785b] font-medium hover:underline">Contact</a>{" "}
        page and we'll help.
      </Note>
    </>
  ),
};

/* ----------------------------------------------------------------------------
 * Page.
 * ------------------------------------------------------------------------- */

export default function Docs() {
  const [active, setActive] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hash.replace("#", "");
      if (h && CONTENT[h]) return h;
    }
    return "introduction";
  });
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Keep the URL hash in sync + react to back/forward navigation.
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h && CONTENT[h]) setActive(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (id: string) => {
    setActive(id);
    setMobileNavOpen(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      mainRef.current?.scrollIntoView({ block: "start" });
    }
  };

  const idx = FLAT.findIndex((i) => i.id === active);
  const prev = idx > 0 ? FLAT[idx - 1] : null;
  const next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null;
  const activeLabel = FLAT.find((i) => i.id === active)?.label ?? "Documentation";

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV;
    return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) })).filter(
      (g) => g.items.length > 0,
    );
  }, [query]);

  const SidebarNav = (
    <nav className="space-y-6">
      {filteredNav.map((g) => (
        <div key={g.title}>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[color:var(--mx-faint)]">{g.title}</div>
          <div className="space-y-0.5">
            {g.items.map((it) => (
              <button
                key={it.id}
                onClick={() => go(it.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-[13.5px] transition-colors ${
                  active === it.id
                    ? "bg-[var(--mx-coral-soft)] text-[#e05f40] font-semibold"
                    : "text-[color:var(--mx-mute)] hover:text-[color:var(--mx-ink)] hover:bg-[var(--mx-surface)]"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {filteredNav.length === 0 && (
        <p className="px-3 text-[13px] text-[color:var(--mx-faint)]">No sections match "{query}".</p>
      )}
    </nav>
  );

  return (
    <div className="mkt-x min-h-screen" style={{ background: "var(--mx-card)" }}>
      <LandingNavbar />

      <div className="pt-[96px]">
        <div className="max-w-[1240px] mx-auto flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[270px] shrink-0 border-r border-[var(--mx-border)]">
            <div className="sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto px-4 py-8">
              <div className="relative mb-5">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mx-faint)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search docs…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--mx-surface)] border border-[var(--mx-border)] text-[13px] text-[color:var(--mx-ink)] placeholder:text-[color:var(--mx-faint)] focus:outline-none focus:ring-2 focus:ring-[#ef785b]/30"
                />
              </div>
              {SidebarNav}
            </div>
          </aside>

          {/* Main content */}
          <main ref={mainRef} className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
            {/* Mobile section selector */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setMobileNavOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-surface)] text-[14px] font-semibold text-[color:var(--mx-ink)]"
              >
                {activeLabel}
                <ChevronRight size={16} className={`text-[color:var(--mx-faint)] transition-transform ${mobileNavOpen ? "rotate-90" : ""}`} />
              </button>
              {mobileNavOpen && (
                <div className="mt-2 rounded-xl border border-[var(--mx-border)] bg-[var(--mx-card)] p-3">
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mx-faint)]" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search docs…"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--mx-surface)] border border-[var(--mx-border)] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#ef785b]/30"
                    />
                  </div>
                  {SidebarNav}
                </div>
              )}
            </div>

            <div className="max-w-[760px]">
              <article key={active} className="animate-fade-up">
                {CONTENT[active]}
              </article>

              {/* Prev / next */}
              <div className="mt-16 pt-8 border-t border-[var(--mx-border)] grid grid-cols-2 gap-4">
                {prev ? (
                  <button
                    onClick={() => go(prev.id)}
                    className="group text-left rounded-xl border border-[var(--mx-border)] p-4 hover:border-[#ef785b]/40 hover:bg-[var(--mx-coral-soft)] transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--mx-faint)]">
                      <ArrowLeft size={12} /> Previous
                    </span>
                    <span className="mt-1 block text-[14px] font-bold text-[color:var(--mx-ink)] group-hover:text-[#e05f40]">{prev.label}</span>
                  </button>
                ) : (
                  <span />
                )}
                {next ? (
                  <button
                    onClick={() => go(next.id)}
                    className="group text-right rounded-xl border border-[var(--mx-border)] p-4 hover:border-[#ef785b]/40 hover:bg-[var(--mx-coral-soft)] transition-colors"
                  >
                    <span className="flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--mx-faint)]">
                      Next <ArrowRight size={12} />
                    </span>
                    <span className="mt-1 block text-[14px] font-bold text-[color:var(--mx-ink)] group-hover:text-[#e05f40]">{next.label}</span>
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
