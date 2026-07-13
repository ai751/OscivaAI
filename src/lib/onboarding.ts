// Outcome-first onboarding: business type → goals → ONE preconfigured assistant.
// The wizard reuses the industry prompt templates (promptTemplates.ts) and only
// fills their placeholders — no new prompt engineering lives here. Detailed facts
// still belong in the Knowledge Base; the success screen pushes the user there.

import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  School,
  Stethoscope,
  ShoppingBag,
  UtensilsCrossed,
  Building2,
  Briefcase,
  Store,
} from "lucide-react";
import { PROMPT_TEMPLATES, PromptTemplate } from "@/lib/promptTemplates";

export interface BusinessType {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  /** Which PromptTemplate this maps to (promptTemplates.ts). */
  templateId: string;
  /** Job-role name the assistant gets by default ("Admission Assistant", not "Agent #1"). */
  role: string;
  /** CreateAgent personality id that fits the domain. */
  personality: string;
  /** Fills the general/ecommerce templates' [WHAT YOU DO]/[WHAT YOU SELL] when the user leaves "about" empty. */
  aboutFallback: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  { id: "college", label: "College / University", desc: "Admissions, courses, placements", icon: GraduationCap, templateId: "education", role: "Admission Assistant", personality: "friendly", aboutFallback: "a college" },
  { id: "school", label: "School / Coaching", desc: "Enquiries, fees, parent queries", icon: School, templateId: "education", role: "Admission Assistant", personality: "friendly", aboutFallback: "a school" },
  { id: "hospital", label: "Hospital / Clinic", desc: "Appointments, doctors, timings", icon: Stethoscope, templateId: "healthcare", role: "Appointment Assistant", personality: "empathetic", aboutFallback: "a healthcare provider" },
  { id: "store", label: "Online Store / Retail", desc: "Orders, returns, product help", icon: ShoppingBag, templateId: "ecommerce", role: "Store Assistant", personality: "friendly", aboutFallback: "quality products" },
  { id: "hotel", label: "Hotel / Restaurant", desc: "Bookings, menus, directions", icon: UtensilsCrossed, templateId: "general", role: "Reception Assistant", personality: "friendly", aboutFallback: "a hospitality business" },
  { id: "realestate", label: "Real Estate", desc: "Listings, site visits, pricing", icon: Building2, templateId: "general", role: "Sales Assistant", personality: "professional", aboutFallback: "a real estate business" },
  { id: "services", label: "Services / Agency", desc: "Quotes, bookings, support", icon: Briefcase, templateId: "general", role: "Front Desk Assistant", personality: "professional", aboutFallback: "a services business" },
  { id: "other", label: "Other Business", desc: "Any shop, brand or team", icon: Store, templateId: "general", role: "Business Assistant", personality: "professional", aboutFallback: "a local business" },
];

export interface Goal {
  id: string;
  label: string;
  desc: string;
}

export const GOALS: Goal[] = [
  { id: "enquiries", label: "Answer enquiries 24/7", desc: "Instant answers even when you're closed" },
  { id: "leads", label: "Capture leads", desc: "Collect name, email & phone from interested visitors" },
  { id: "appointments", label: "Book appointments & visits", desc: "Guide visitors to book a slot or plan a visit" },
  { id: "support", label: "Handle customer support", desc: "Resolve common questions and route the rest" },
  { id: "pricing", label: "Share pricing & offerings", desc: "Explain what you offer and what it costs" },
];

export interface WizardAnswers {
  businessName: string;
  /** Optional one-liner: what the business does/sells (general & ecommerce templates). */
  about: string;
  city: string;
  language: string;
  roleName: string;
  goalIds: string[];
}

export const LANGUAGES = [
  "English",
  "Hindi",
  "Hinglish (Hindi + English)",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Malayalam",
];

export function templateFor(bt: BusinessType): PromptTemplate {
  return PROMPT_TEMPLATES.find((t) => t.id === bt.templateId) ?? PROMPT_TEMPLATES[PROMPT_TEMPLATES.length - 1];
}

export interface AssistantConfig {
  name: string;
  instructions: string;
  welcomeMsg: string;
  suggestions: string[];
  personality: string;
}

// Each template names the business with a different placeholder.
const NAME_PLACEHOLDERS = ["[INSTITUTION NAME]", "[HOSPITAL/CLINIC NAME]", "[STORE NAME]", "[BUSINESS NAME]"];

function fillNames(text: string, businessName: string): string {
  let out = text;
  for (const ph of NAME_PLACEHOLDERS) out = out.split(ph).join(businessName);
  return out;
}

/** Builds a ready-to-save agent config from the wizard's answers. */
export function buildAssistantConfig(bt: BusinessType, answers: WizardAnswers): AssistantConfig {
  const t = templateFor(bt);
  const businessName = answers.businessName.trim();
  const city = answers.city.trim();
  const about = answers.about.trim() || bt.aboutFallback;

  let prompt = fillNames(t.prompt, businessName);
  // Location: education/healthcare templates carry ", [CITY, STATE]" after the name.
  prompt = prompt.split(", [CITY, STATE]").join(city ? `, ${city}` : "");
  prompt = prompt.split("[CITY, STATE]").join(city || "India");
  // "What you do/sell" (general & ecommerce templates).
  prompt = prompt.split('[WHAT YOU DO, e.g. "a digital marketing agency"]').join(about);
  prompt = prompt.split('[WHAT YOU SELL, e.g. "handmade skincare"]').join(about);
  // Reply language.
  prompt = prompt.split("[LANGUAGE, e.g. English]").join(answers.language);

  // The owner's picked goals become explicit priorities for the assistant.
  const goalLabels = GOALS.filter((g) => answers.goalIds.includes(g.id)).map((g) => g.label.toLowerCase());
  if (goalLabels.length) {
    prompt += `\n## OWNER'S TOP PRIORITIES (set during onboarding)\nThe business owner wants you to focus on: ${goalLabels.join(", ")}. Lean into these in every conversation.\n`;
  }

  const welcomeMsg = fillNames(t.welcomeMsg ?? `Hi! Welcome to ${businessName}. How can I help you today?`, businessName);

  return {
    name: answers.roleName.trim() || bt.role,
    instructions: prompt,
    welcomeMsg,
    suggestions: t.suggestions ?? [],
    personality: bt.personality,
  };
}
