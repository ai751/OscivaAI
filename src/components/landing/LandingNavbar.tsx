import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X as CloseIcon, Sun, Moon, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { industries } from "@/data/industries";

/* Expedify-style token set (from design-system skill). Most values resolve to
   CSS variables defined under .mkt-x / .dark .mkt-x in index.css, so every
   marketing component is light/dark aware without any per-component work.
   Coral stays constant across themes; `inkSolid` is for surfaces that must
   remain dark in both themes (e.g. buttons sitting on the coral gradient). */
export const X = {
  ink: "var(--mx-ink)",
  inkSolid: "#111827",
  sub: "var(--mx-sub)",
  mute: "var(--mx-mute)",
  faint: "var(--mx-faint)",
  border: "var(--mx-border)",
  borderStrong: "var(--mx-border-strong)",
  surface: "var(--mx-surface)",
  coral: "#ef785b",
  coralDark: "#e05f40",
  /* Signature pill-button gradient (differs from the flat expedify look). */
  coralGrad: "linear-gradient(135deg, #f08a67 0%, #ef785b 45%, #e05f40 100%)",
  coralGradHover: "linear-gradient(135deg, #ef785b 0%, #e05f40 55%, #cf4f2c 100%)",
  btnShadow: "0 6px 18px rgba(239,120,91,0.35)",
  coralSoft: "var(--mx-coral-soft)",
  cream: "var(--mx-cream)",
  lavender: "var(--mx-lavender)",
  white: "var(--mx-card)",
  green: "#22c55e",
  hairline: "var(--mx-hairline)",
  shadow1: "rgba(0,0,0,0.1) 0px 20px 25px -5px, rgba(0,0,0,0.1) 0px 8px 10px -6px",
  shadow3: "rgba(0,0,0,0.15) 0px 4px 12px 0px",
} as const;

const navLinksBefore = [{ label: "Features", path: "/features" }];
const navLinksAfter = [
  { label: "Pricing", path: "/pricing" },
  { label: "Docs", path: "/docs" },
  { label: "Contact us", path: "/contact" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const ThemeToggle = (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
      style={{ background: X.surface, color: X.ink }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="mkt-x fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3">
      <nav
        className="max-w-[1280px] mx-auto rounded-[16px] transition-shadow duration-300"
        style={{
          background: X.white,
          boxShadow: scrolled ? X.shadow1 : X.shadow3,
        }}
      >
        <div className="flex items-center justify-between pl-5 pr-3 h-[72px]">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-9 w-9" />
            <span className="text-[22px] font-bold tracking-[-0.01em]" style={{ color: X.ink }}>
              Osciva <span style={{ color: X.coral }}>AI</span>
            </span>
          </a>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-1 ml-6 mr-auto">
            {navLinksBefore.map((l) => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="px-3.5 py-2 text-[15px] font-medium transition-colors"
                style={{ color: X.ink }}
                onMouseEnter={(e) => (e.currentTarget.style.color = X.coral)}
                onMouseLeave={(e) => (e.currentTarget.style.color = X.ink)}
              >
                {l.label}
              </button>
            ))}

            {/* Solutions dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-3.5 py-2 text-[15px] font-medium transition-colors"
                style={{ color: solutionsOpen ? X.coral : X.ink }}
                aria-expanded={solutionsOpen}
                onClick={() => setSolutionsOpen((o) => !o)}
              >
                Solutions
                <ChevronDown
                  size={14}
                  className="transition-transform duration-200"
                  style={{ transform: solutionsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {solutionsOpen && (
                <div
                  className="absolute left-0 top-full pt-2 w-[220px]"
                >
                  <div
                    className="p-2 rounded-[14px]"
                    style={{ background: X.white, boxShadow: X.shadow1, border: `1px solid ${X.border}` }}
                  >
                    {industries.map((ind) => (
                      <button
                        key={ind.slug}
                        onClick={() => {
                          setSolutionsOpen(false);
                          navigate(`/solutions/${ind.slug}`);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors"
                        style={{ background: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = X.coralSoft)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span
                          className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
                          style={{ background: X.coralSoft }}
                        >
                          <ind.icon size={16} strokeWidth={1.8} style={{ color: X.coral }} />
                        </span>
                        <span className="text-[14px] font-bold" style={{ color: X.ink }}>
                          {ind.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {navLinksAfter.map((l) => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="px-3.5 py-2 text-[15px] font-medium transition-colors"
                style={{ color: X.ink }}
                onMouseEnter={(e) => (e.currentTarget.style.color = X.coral)}
                onMouseLeave={(e) => (e.currentTarget.style.color = X.ink)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {ThemeToggle}
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2.5 rounded-full text-[15px] font-bold text-white transition-colors"
                style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-5 py-2.5 rounded-full text-[15px] font-medium border transition-colors"
                  style={{ borderColor: X.coral, color: X.coral, background: X.white }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = X.coralSoft)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = X.white)}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-6 py-2.5 rounded-full text-[15px] font-bold text-white transition-colors"
                  style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden flex items-center gap-1.5">
            {ThemeToggle}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2"
              style={{ color: X.ink }}
              aria-label="Menu"
            >
              {mobileOpen ? <CloseIcon size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden px-4 pb-4 pt-1 border-t" style={{ borderColor: X.border }}>
            {navLinksBefore.map((l) => (
              <button
                key={l.label}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(l.path);
                }}
                className="block w-full text-left py-3 px-2 text-[15px] font-medium"
                style={{ color: X.ink }}
              >
                {l.label}
              </button>
            ))}
            <div className="py-2 px-2">
              <span className="block text-[12.5px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: X.faint }}>
                Solutions
              </span>
              {industries.map((ind) => (
                <button
                  key={ind.slug}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(`/solutions/${ind.slug}`);
                  }}
                  className="flex items-center gap-2.5 w-full text-left py-2.5 px-1 text-[15px] font-medium"
                  style={{ color: X.ink }}
                >
                  <ind.icon size={16} strokeWidth={1.8} style={{ color: X.coral }} />
                  {ind.name}
                </button>
              ))}
            </div>
            {navLinksAfter.map((l) => (
              <button
                key={l.label}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(l.path);
                }}
                className="block w-full text-left py-3 px-2 text-[15px] font-medium"
                style={{ color: X.ink }}
              >
                {l.label}
              </button>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full py-3 rounded-full text-white text-[15px] font-bold"
                  style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/auth");
                    }}
                    className="w-full py-3 rounded-full text-white text-[15px] font-bold"
                    style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/auth");
                    }}
                    className="w-full py-3 rounded-full text-[15px] font-medium border"
                    style={{ borderColor: X.coral, color: X.coral }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
