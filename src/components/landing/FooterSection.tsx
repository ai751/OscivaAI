import { useNavigate } from "react-router-dom";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import { X } from "./LandingNavbar";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Features", path: "/features" },
      { label: "Pricing", path: "/pricing" },
      { label: "Docs", path: "/docs" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Education", path: "/solutions/education" },
      { label: "Healthcare", path: "/solutions/healthcare" },
      { label: "E-commerce", path: "/solutions/ecommerce" },
      { label: "General Business", path: "/solutions/business" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Careers", path: "/careers" },
      { label: "Blog", path: "/blog" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", path: "/privacy" },
      { label: "Terms", path: "/terms" },
      { label: "DPDP", path: "/dpdp" },
      { label: "Security", path: "/security" },
    ],
  },
];

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Youtube, label: "YouTube" },
  { icon: Linkedin, label: "LinkedIn" },
];

export default function FooterSection() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="mkt-x border-t px-5 sm:px-8 pt-14 pb-8" style={{ background: X.white, borderColor: X.border }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-9 w-9" />
              <span className="text-[22px] font-bold" style={{ color: X.ink }}>Osciva <span style={{ color: X.coral }}>AI</span></span>
            </div>
            <p className="text-[14px] leading-[22px] max-w-[280px]" style={{ color: X.mute }}>
              AI support agents trained on your business. Stop answering the same
              questions, start automating every conversation.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[14px] font-bold mb-4" style={{ color: X.ink }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-[14px] transition-colors"
                      style={{ color: X.mute }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = X.coral)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = X.mute)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Socials */}
          <div>
            <h4 className="text-[14px] font-bold mb-4" style={{ color: X.ink }}>
              Follow us
            </h4>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <span
                  key={s.label}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-[10px] grid place-items-center cursor-pointer transition-colors"
                  style={{ background: X.surface, color: X.ink }}
                >
                  <s.icon size={17} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex items-center justify-center" style={{ borderColor: X.border }}>
          <p className="text-[13px]" style={{ color: X.faint }}>
            © {year} Osciva AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
