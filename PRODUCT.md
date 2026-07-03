# Product

## Register

product

> Default register is `product` (the core surface is the agent-builder dashboard).
> Marketing pages (`/`, `/features`, `/pricing`, `/how-it-works`, `/contact`, `/docs`
> landing) are worked in the **brand** register per-task.

## Users

Small-business owners and lean teams who want an AI chat agent on their website
without hiring developers. Non-technical to semi-technical; they arrive with a
website and business documents, and want a working, on-brand chat widget the same
day. BYOK (they bring their own LLM API key), so cost transparency and trust matter.

## Product Purpose

Osciva AI lets users create, train (RAG over their own content), customize, and
embed AI chat agents. Success = a visitor lands on the marketing site, signs up,
builds an agent from their content, and pastes one embed snippet into their site.
Stack: Vite + React SPA, Supabase backend (auth, pgvector hybrid search, edge
functions), Vercel hosting.

## Brand Personality

Premium & minimal — calm, confident, precise. Warmth is carried by a single
signature coral (#ef785b) and generous whitespace, not by loud color or dense
decoration. Motion is restrained and exponential-eased; nothing bounces.
Three words: **composed, warm, exact**.

## Anti-references

- Generic AI-startup slop: purple/blue gradients, glassmorphism cards, sparkle
  emoji, "revolutionize your workflow" copy.
- Dark "hacker AI" aesthetic — terminal greens, matrix motifs.
- Template SaaS grids: identical icon-heading-text cards repeated per section.
- Overstuffed landing pages that shout; Osciva speaks quietly and precisely.

## Design Principles

1. **One signature color.** Coral is the only voice color; everything else is
   ink, paper, and hairlines. If an element competes with coral, mute it.
2. **Motion earns its place.** One well-orchestrated moment (page load, reveal)
   beats scattered micro-animations. Exponential ease-out, no bounce, always a
   reduced-motion fallback.
3. **Theme parity is non-negotiable.** Every marketing surface reads through
   `--mx-*` tokens so light (default) and dark both ship first-class.
4. **Show the product, don't describe it.** Prefer live widget demos and real
   screenshots over abstract illustration.
5. **Calm confidence in copy.** Plain sentences, no hype adjectives, no
   exclamation marks.

## Accessibility & Inclusion

WCAG 2.1 AA target. Body text ≥4.5:1 contrast in both themes. Every animation
has a `prefers-reduced-motion` alternative (crossfade or instant). Full keyboard
navigation on interactive marketing elements; the embedded chat widget must be
usable by end-customers with screen readers.
