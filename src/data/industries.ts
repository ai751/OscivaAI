import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Store,
  CalendarCheck,
  Stethoscope,
  Clock,
  Receipt,
  FlaskConical,
  ClipboardList,
  FileText,
  IndianRupee,
  BookOpen,
  Home,
  CalendarDays,
  Bell,
  PackageSearch,
  RotateCcw,
  MessageCircleQuestion,
  Ruler,
  Truck,
  BadgePercent,
  MapPin,
  Wrench,
  CalendarClock,
  UserPlus,
  ScrollText,
  HelpCircle,
} from "lucide-react";

export interface IndustryUseCase {
  icon: LucideIcon;
  title: string;
  desc: string;
  ex: string;
}

export interface IndustryChatMsg {
  from: "visitor" | "agent";
  text: string;
}

export interface Industry {
  slug: string;
  name: string;
  shortDesc: string;
  icon: LucideIcon;
  hero: { title: string; highlight: string; subtitle: string };
  pains: { title: string; desc: string }[];
  handles: IndustryUseCase[];
  chatTitle: string;
  chatAgentName: string;
  chat: IndustryChatMsg[];
  chatPoints: string[];
  faqs: { q: string; a: string }[];
}

export const industries: Industry[] = [
  {
    slug: "education",
    name: "Education",
    shortDesc: "Admissions, fees, courses and campus questions answered instantly for students and parents.",
    icon: GraduationCap,
    hero: {
      title: "Answer Every Student and Parent,",
      highlight: "Day and Night",
      subtitle:
        "Train an agent on your prospectus, fee structure and policies. Families get instant, accurate answers while your office focuses on enrolments, not repeated phone calls.",
    },
    pains: [
      {
        title: "Admission season overload",
        desc: "Hundreds of calls about eligibility, dates and documents hit your front office in the same six weeks. Staff burn out, callers wait.",
      },
      {
        title: "Answers scattered everywhere",
        desc: "Fees live in a PDF, timetables on a notice board, hostel rules with the warden. Students give up before they find anything.",
      },
      {
        title: "Parents research after hours",
        desc: "Working parents compare institutions at 10 pm, long after your office has closed. Unanswered questions become lost admissions.",
      },
    ],
    handles: [
      { icon: ClipboardList, title: "Admissions & eligibility", desc: "Entry criteria, required documents, application steps and important dates.", ex: "“Which documents do I need for BCA admission?”" },
      { icon: IndianRupee, title: "Fees & scholarships", desc: "Program-wise fee breakdowns, payment schedules and scholarship criteria.", ex: "“What is the total fee for the M.Com program?”" },
      { icon: BookOpen, title: "Courses & curriculum", desc: "Subjects, electives, internships and career outcomes for every program.", ex: "“Does the B.Tech include an internship semester?”" },
      { icon: Home, title: "Hostel & campus life", desc: "Hostel availability, transport routes, mess, labs and library timings.", ex: "“Is hostel available for first-year students?”" },
      { icon: CalendarDays, title: "Exams & results", desc: "Exam schedules, revaluation steps and where to check results.", ex: "“When do semester 3 exams start?”" },
      { icon: Bell, title: "Deadlines & events", desc: "Application deadlines, orientation dates, fests and holiday calendars.", ex: "“What is the last date to apply?”" },
    ],
    chatTitle: "A real admissions conversation",
    chatAgentName: "Admissions Assistant",
    chat: [
      { from: "visitor", text: "What's the last date to apply for BBA?" },
      { from: "agent", text: "Applications for the BBA program close on 30 June. You'll need your 12th marksheet, a passport-size photo and one ID proof. Would you like the application link?" },
      { from: "visitor", text: "Yes. Also, is there any scholarship?" },
      { from: "agent", text: "Students scoring above 85% in their 12th board exams are eligible for a merit scholarship on first-year tuition. I've shared the application link and the scholarship form below." },
    ],
    chatPoints: [
      "Answers pulled from your own prospectus and fee PDFs, never invented",
      "Replies in 20+ Indian languages, so parents can ask in the language they think in",
      "Captures name and phone number of interested applicants for your counselors",
      "Every conversation logged, so you see exactly what applicants ask most",
    ],
    faqs: [
      {
        q: "Can it answer in regional languages?",
        a: "Yes. The agent detects the visitor's language and replies in it, including Hindi, Kannada, Tamil, Telugu, Marathi, Bengali and more. Your knowledge base can stay in English.",
      },
      {
        q: "How do we update fees or dates each year?",
        a: "Upload the new PDF or edit the text in your dashboard. The agent re-indexes automatically and starts answering with the new information within minutes.",
      },
      {
        q: "Can it pass serious enquiries to our admissions team?",
        a: "Yes. The agent can collect the visitor's name and contact details and share your admission office's number or email, so counselors follow up with warm leads instead of cold calls.",
      },
      {
        q: "Will it work on our existing college website?",
        a: "Yes. You paste one script tag into your site, whatever it is built on. WordPress and custom sites are both fine, and the widget matches your institution's colors.",
      },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    shortDesc: "OPD timings, doctor availability, appointments and billing queries handled before they reach your desk.",
    icon: HeartPulse,
    hero: {
      title: "Give Patients Answers Before They",
      highlight: "Reach the Front Desk",
      subtitle:
        "Hospitals and clinics field the same operational questions all day. Train an agent on your departments, doctors and policies so phone lines stay free for people who truly need them.",
    },
    pains: [
      {
        title: "Phone lines stay jammed",
        desc: "Reception answers the same questions about timings, directions and doctor availability dozens of times a day while patients wait on hold.",
      },
      {
        title: "Anxious questions after hours",
        desc: "Patients and families search for visiting hours, report collection and OPD schedules at night, when nobody picks up the phone.",
      },
      {
        title: "Every department answers differently",
        desc: "Billing says one thing, reception another. Without a single source of truth, patients get conflicting information and lose trust.",
      },
    ],
    handles: [
      { icon: CalendarCheck, title: "Appointments & OPD timings", desc: "OPD schedules by department, how to book, and what to bring.", ex: "“How do I book an appointment in Orthopedics?”" },
      { icon: Stethoscope, title: "Doctor & department lookup", desc: "Which doctors sit when, their specialisations and consultation days.", ex: "“Is Dr. Meera Nair available this Saturday?”" },
      { icon: Clock, title: "Visiting hours & directions", desc: "Ward visiting rules, parking, and directions to the right block.", ex: "“What are the ICU visiting hours?”" },
      { icon: Receipt, title: "Insurance & billing", desc: "Empanelled insurers, cashless process and estimate requests.", ex: "“Do you accept my insurance for cashless treatment?”" },
      { icon: FlaskConical, title: "Tests & reports", desc: "Test preparation instructions and how to collect or download reports.", ex: "“Do I need to fast before the lipid profile test?”" },
      { icon: FileText, title: "Health checkup packages", desc: "Package contents, pricing and how to schedule a full-body checkup.", ex: "“What does the executive health checkup include?”" },
    ],
    chatTitle: "A real patient conversation",
    chatAgentName: "Patient Help Desk",
    chat: [
      { from: "visitor", text: "Is Dr. Meera Nair available this Saturday?" },
      { from: "agent", text: "Dr. Meera Nair from Cardiology has OPD on Saturdays from 10 am to 1 pm. Appointments can be booked at the desk or by phone. Would you like the appointment number?" },
      { from: "visitor", text: "Yes please. And can my father get a wheelchair at the entrance?" },
      { from: "agent", text: "Certainly. Wheelchair assistance is available at the main entrance; just inform the help desk on arrival. The appointment line is listed below, open 8 am to 8 pm." },
    ],
    chatPoints: [
      "Answers operational questions only and directs clinical questions to your staff",
      "One consistent source of truth across reception, billing and every department",
      "Available at 2 am when a worried family member is searching your site",
      "Transcripts show you the gaps in your website's information",
    ],
    faqs: [
      {
        q: "Will it give medical advice?",
        a: "No. The agent answers operational and informational questions from the content you provide, like timings, procedures and packages. It is instructed to direct symptom or treatment questions to your medical staff.",
      },
      {
        q: "How do we keep doctor schedules current?",
        a: "Update the schedule in your dashboard or re-upload the roster document. The agent re-indexes automatically, so changed OPD timings reflect within minutes.",
      },
      {
        q: "Is patient conversation data secure?",
        a: "Yes. Conversations are encrypted in transit and at rest, hosted on Indian infrastructure, and handled in line with India's DPDP Act. You control the data and can delete it any time.",
      },
      {
        q: "Can it hand over to a human?",
        a: "Yes. For anything it cannot answer, the agent shares your help desk number or collects the caller's details so your team can phone back.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    shortDesc: "Order tracking, returns, sizing and product questions answered instantly, around the clock.",
    icon: ShoppingBag,
    hero: {
      title: "Turn Support Questions Into",
      highlight: "Repeat Customers",
      subtitle:
        "Most store tickets are the same five questions on repeat. Train an agent on your policies and catalog so shoppers get instant answers and your team handles the exceptions.",
    },
    pains: [
      {
        title: "“Where is my order?” on repeat",
        desc: "Half your support inbox is order-status anxiety. Every ticket costs money and every slow reply costs a future purchase.",
      },
      {
        title: "Returns confusion kills trust",
        desc: "Shoppers abandon carts when the return policy is unclear, and flood support after buying because nobody read the fine print.",
      },
      {
        title: "Carts abandoned at midnight",
        desc: "A shopper unsure about sizing or delivery time at 11 pm will not email you and wait. They just buy somewhere else.",
      },
    ],
    handles: [
      { icon: PackageSearch, title: "Order status & tracking", desc: "How to track orders, expected timelines and courier information.", ex: "“How long does delivery take to Pune?”" },
      { icon: RotateCcw, title: "Returns & refunds", desc: "Return windows, refund timelines and step-by-step return process.", ex: "“Can I return this if the size doesn't fit?”" },
      { icon: MessageCircleQuestion, title: "Product questions", desc: "Materials, compatibility, care instructions and stock queries.", ex: "“Is this kurta pure cotton?”" },
      { icon: Ruler, title: "Sizing & fit", desc: "Size charts, fit guidance and comparisons between sizes.", ex: "“I'm usually a medium. Which size should I take?”" },
      { icon: Truck, title: "Shipping & COD", desc: "Delivery charges, serviceable pincodes and cash-on-delivery rules.", ex: "“Is cash on delivery available at 560076?”" },
      { icon: BadgePercent, title: "Offers & coupons", desc: "Active discounts, coupon rules and first-order offers.", ex: "“Why isn't my coupon code working?”" },
    ],
    chatTitle: "A real shopper conversation",
    chatAgentName: "Store Assistant",
    chat: [
      { from: "visitor", text: "Can I return this if the size doesn't fit?" },
      { from: "agent", text: "Yes. You can return or exchange any item within 7 days of delivery, as long as the tags are intact. Exchanges for a different size are free; refunds go back to your original payment method." },
      { from: "visitor", text: "How do I start a return?" },
      { from: "agent", text: "Go to My Orders, select the item and choose Return or Exchange. Pickup is arranged from your address within 2 working days. Would you like the direct link?" },
    ],
    chatPoints: [
      "One-click install on Shopify and WordPress, one script tag anywhere else",
      "Widget styled to your brand, with your logo and colors",
      "Analytics reveal your most-asked product questions, so you can fix listings",
      "Handles the midnight rush while your team sleeps",
    ],
    faqs: [
      {
        q: "Does it integrate with Shopify?",
        a: "Yes. There's a one-click Shopify install, and the same for WordPress and WooCommerce. For custom storefronts you paste one script tag.",
      },
      {
        q: "How does it know my policies and products?",
        a: "You upload your policy pages, FAQs and catalog data, or point the agent at your store URL. It indexes the content and answers only from what you provided.",
      },
      {
        q: "What happens when it can't answer?",
        a: "It says so honestly and offers your support email or collects the shopper's contact details, so no question disappears into a void.",
      },
      {
        q: "Can it upsell or recommend products?",
        a: "It can answer comparison questions and point shoppers to relevant items from your catalog content. It won't invent recommendations beyond what your data supports.",
      },
    ],
  },
  {
    slug: "business",
    name: "General Business",
    shortDesc: "Hours, pricing, bookings and quotes for clinics, salons, gyms, agencies and every service business.",
    icon: Store,
    hero: {
      title: "Every Business With Customers Has",
      highlight: "Questions to Answer",
      subtitle:
        "Salons, gyms, real estate, agencies, SaaS: if people ask you the same questions on calls and WhatsApp every day, an agent trained on your business can answer them first.",
    },
    pains: [
      {
        title: "Same questions, every single day",
        desc: "Hours, prices, availability, directions. Your phone and WhatsApp repeat the same loop while real work waits.",
      },
      {
        title: "Leads go cold overnight",
        desc: "Someone finds you at 9 pm, has one question, gets no answer, and books with the competitor who replied first.",
      },
      {
        title: "Your website is a static brochure",
        desc: "Visitors skim, don't find their exact answer, and leave. A page can't ask what they actually need.",
      },
    ],
    handles: [
      { icon: MapPin, title: "Hours & location", desc: "Opening hours, holidays, directions and parking.", ex: "“Are you open this Sunday?”" },
      { icon: Wrench, title: "Services & pricing", desc: "What you offer, what it costs and how long it takes.", ex: "“How much is a full-body massage for 60 minutes?”" },
      { icon: CalendarClock, title: "Bookings & availability", desc: "How to book, reschedule or cancel, and slot availability.", ex: "“Can I book a trial class for tomorrow evening?”" },
      { icon: UserPlus, title: "Lead capture", desc: "Collects names and numbers from interested visitors for follow-up.", ex: "“Can someone call me back about membership plans?”" },
      { icon: ScrollText, title: "Policies & terms", desc: "Cancellation rules, refund terms, warranties and guarantees.", ex: "“What is your cancellation policy?”" },
      { icon: HelpCircle, title: "Anything in your FAQs", desc: "Every question you've ever written an answer for, served instantly.", ex: "“Do you have women-only workout hours?”" },
    ],
    chatTitle: "A real customer conversation",
    chatAgentName: "Business Assistant",
    chat: [
      { from: "visitor", text: "Do you have women-only workout hours?" },
      { from: "agent", text: "Yes. The gym is women-only from 11 am to 1 pm on weekdays, with women trainers on the floor during those hours. Would you like to book a free trial session?" },
      { from: "visitor", text: "Yes, tomorrow around noon if possible." },
      { from: "agent", text: "Great choice. Please share your name and phone number, and our team will confirm your 12 pm trial slot for tomorrow." },
    ],
    chatPoints: [
      "Set up in about 30 minutes with the content you already have",
      "Answers from your real prices and policies, never guesses",
      "Captures the visitor's details so you follow up while interest is hot",
      "Transparent INR pricing with GST invoices, built for Indian businesses",
    ],
    faqs: [
      {
        q: "My business is small. Is this overkill?",
        a: "No. If you answer even ten repeated questions a day, the agent pays for itself. The free tier lets you try it with zero commitment.",
      },
      {
        q: "I don't have documents to upload. What do I train it on?",
        a: "Your website URL is enough to start. You can also paste plain text: your price list, your policies, your FAQs. Most businesses are live within half an hour.",
      },
      {
        q: "Can it book appointments directly?",
        a: "The agent shares your booking link or collects the visitor's preferred slot and contact details for your team to confirm. Direct calendar integrations are on our roadmap.",
      },
      {
        q: "What does it cost?",
        a: "There's a free plan to start, and paid plans are priced in INR with GST invoices. See the pricing page for current tiers.",
      },
    ],
  },
];

export function getIndustry(slug: string | undefined): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}
