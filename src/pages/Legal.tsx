import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import { FadeIn } from "@/components/landing/xui";

type Section = { heading: string; body: string[] };
type Doc = { breadcrumb: string; title: string; updated: string; intro: string; sections: Section[] };

const docs: Record<string, Doc> = {
  privacy: {
    breadcrumb: "Privacy",
    title: "Privacy Policy",
    updated: "1 June 2026",
    intro: "How Osciva collects, uses and protects the data you and your customers share with us.",
    sections: [
      { heading: "Information we collect", body: [
        "We collect the account details you provide when you sign up (name, email and organisation), the content you upload to train your agents, and usage data such as message volume and feature activity.",
        "We do not sell your data, and we never use the documents you upload to train shared or third-party models.",
      ] },
      { heading: "How we use your data", body: [
        "Your data is used to operate the service: building your private knowledge base, generating answers for your agents, and showing you analytics about how your agents perform.",
        "We may use aggregated, anonymised metrics to improve the platform.",
      ] },
      { heading: "Data retention", body: [
        "We keep your data for as long as your account is active. When you delete an agent or close your account, the associated knowledge base and transcripts are removed from production systems within 30 days.",
      ] },
      { heading: "Your rights", body: [
        "You can access, export or delete your data at any time from your account settings, or by writing to privacy@osciva.io.",
      ] },
    ],
  },
  terms: {
    breadcrumb: "Terms",
    title: "Terms of Service",
    updated: "1 June 2026",
    intro: "The agreement that governs your use of the Osciva platform.",
    sections: [
      { heading: "Using Osciva", body: [
        "By creating an account you agree to use Osciva lawfully and to take responsibility for the content you upload and the agents you deploy.",
        "You retain full ownership of your content. You grant us only the limited rights needed to host and process it so the service can function.",
      ] },
      { heading: "Plans and billing", body: [
        "Paid plans are billed in advance on a monthly or yearly cycle in INR, with GST invoices. You can upgrade, downgrade or cancel at any time, and changes take effect from the next cycle.",
      ] },
      { heading: "Acceptable use", body: [
        "You may not use Osciva to build agents that share illegal content, infringe others' rights, or attempt to disrupt the platform. We may suspend accounts that violate these terms.",
      ] },
      { heading: "Liability", body: [
        "Osciva is provided on an as-is basis. To the extent permitted by law, our liability is limited to the fees you paid in the previous 12 months.",
      ] },
    ],
  },
  dpdp: {
    breadcrumb: "DPDP",
    title: "DPDP Compliance",
    updated: "1 June 2026",
    intro: "How Osciva aligns with India's Digital Personal Data Protection Act.",
    sections: [
      { heading: "Data residency", body: [
        "All customer data and knowledge bases are stored on infrastructure hosted in India, helping you meet local data-residency expectations.",
      ] },
      { heading: "Lawful processing", body: [
        "We process personal data only for the purposes you direct, on the basis of the consent and notices you provide to your own customers. You act as the Data Fiduciary; Osciva acts as a Data Processor on your behalf.",
      ] },
      { heading: "Principal rights", body: [
        "We provide the tooling you need to honour data-principal requests, including access, correction and erasure of records held inside your agents.",
      ] },
      { heading: "Breach handling", body: [
        "We maintain monitoring and incident-response processes, and will notify you without undue delay if a personal-data breach affecting your account is detected.",
      ] },
    ],
  },
  security: {
    breadcrumb: "Security",
    title: "Security",
    updated: "1 June 2026",
    intro: "The controls we use to keep your data and your customers' conversations safe.",
    sections: [
      { heading: "Encryption", body: [
        "All data is encrypted in transit with TLS and encrypted at rest. Knowledge bases are isolated per agent so one agent can never read another's content.",
      ] },
      { heading: "Access control", body: [
        "Access to production systems is restricted, logged and reviewed. LLM provider keys you bring are stored server-side and are never exposed to visitors or embedded in the widget.",
      ] },
      { heading: "Infrastructure", body: [
        "We run on hardened, India-hosted infrastructure with automated backups and continuous monitoring for availability and abuse.",
      ] },
      { heading: "Reporting an issue", body: [
        "Found a vulnerability? We want to hear from you. Email security@osciva.io and we will respond promptly.",
      ] },
    ],
  },
};

export default function Legal({ slug }: { slug: keyof typeof docs }) {
  const doc = docs[slug];

  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero breadcrumb={doc.breadcrumb} title={doc.title} subtitle={doc.intro} primaryCta={null} />

      <section className="px-5 sm:px-8 pb-20 md:pb-24" style={{ background: X.white }}>
        <div className="max-w-[760px] mx-auto">
          <p className="text-[13px] mb-10" style={{ color: X.faint }}>Last updated {doc.updated}</p>
          <div className="space-y-10">
            {doc.sections.map((s, i) => (
              <FadeIn key={s.heading} delay={(i % 3) * 0.06}>
                <div>
                  <h2 className="text-[20px] font-bold mb-3" style={{ color: X.ink }}>{s.heading}</h2>
                  {s.body.map((p, j) => (
                    <p key={j} className="text-[14.5px] leading-[26px] mb-3" style={{ color: X.sub }}>{p}</p>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
