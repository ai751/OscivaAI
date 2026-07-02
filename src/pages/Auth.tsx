import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Check, Bot, Zap, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import CountUp from "@/components/landing/CountUp";
import { supabase } from "@/integrations/supabase/client";
import { useForceLightTheme } from "@/hooks/useTheme";


const passwordRules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special char", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const floatingIcons = [
  { icon: Bot, x: "10%", y: "20%", delay: 0, size: 32 },
  { icon: Zap, x: "80%", y: "15%", delay: 0.5, size: 24 },
  { icon: Shield, x: "15%", y: "75%", delay: 1, size: 28 },
  { icon: Sparkles, x: "85%", y: "70%", delay: 1.5, size: 26 },
  { icon: Bot, x: "50%", y: "85%", delay: 0.8, size: 20 },
];

const rotatingWords = ["agents", "chatbots", "assistants"];

export default function AuthPage() {
  // The auth page is part of the marketing funnel — always light, like the site.
  useForceLightTheme();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % rotatingWords.length), 2600);
    return () => clearInterval(id);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === "signup" && !fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (mode === "signup") {
      if (passwordRules.filter((r) => !r.test(password)).length > 0) errs.password = "Password too weak";
    } else if (password.length < 6) errs.password = "Min 6 characters";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ fullName: true, email: true, password: true });
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { name: fullName.trim() },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Account created! Welcome to Osciva AI.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Invalid email or password"
              : error.message,
          );
          return;
        }
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      // Supabase redirects the browser to Google; nothing else to do here.
    } catch {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const passedCount = passwordRules.filter((r) => r.test(password)).length;
  const strengthPercent = (passedCount / passwordRules.length) * 100;

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Enter your email above first, then click 'Forgot password'.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent. Check your inbox.");
  };

  return (
    <div className="mkt-x min-h-screen flex bg-background relative overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10 pointer-events-none hidden lg:block"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          <item.icon size={item.size} />
        </motion.div>
      ))}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <motion.div
          className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative z-10 w-full flex flex-col justify-center p-12 xl:p-16">
          <motion.button
            onClick={() => navigate("/")}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-12 left-12 xl:top-16 xl:left-16 flex items-center gap-2.5 w-fit"
          >
            <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-9 w-9" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Osciva <span className="text-primary">AI</span>
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-md"
          >
            <h2 className="text-3xl xl:text-[40px] font-bold text-foreground leading-[1.1]">
              Build AI{" "}
              <span className="relative inline-flex whitespace-nowrap align-bottom">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={rotatingWords[wordIndex]}
                    className="text-primary"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>{" "}
              that actually know your business.
            </h2>
            <p className="mt-4 text-[15px] text-foreground-secondary leading-relaxed">
              Train an assistant on your own data and deploy it anywhere, in minutes. No developers, no glue code.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Trained on your documents, website and FAQs",
                "Live on any site in about 30 minutes",
                "20+ Indian languages, GST invoices, India-hosted",
              ].map((v, i) => (
                <motion.li
                  key={v}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 + i * 0.1 }}
                  className="flex items-center gap-3 text-[14.5px] text-foreground/80"
                >
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-primary/15 shrink-0">
                    <Check size={12} className="text-primary" />
                  </span>
                  {v}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex gap-9 mt-12"
          >
            {[
              { value: 500, suffix: "+", label: "Businesses" },
              { value: 10, suffix: "M+", label: "Messages" },
              { value: 99.9, decimals: 1, suffix: "%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary">
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <div className="text-xs text-foreground-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </button>

          <div className="flex items-center gap-2.5 mb-8">
            <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-10 w-10" />
            <span className="text-xl font-extrabold text-foreground">
              Osciva <span className="text-primary">AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-foreground-muted mb-6">
            {mode === "signin" ? "Sign in to manage your AI agents" : "Get started with Osciva AI today"}
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium text-foreground mb-4 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-foreground-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); setTouched({}); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 min-h-[280px]">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="fullname"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    placeholder="Full name"
                    className={`w-full px-4 py-2.5 rounded-lg bg-card border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
                      touched.fullName && errors.fullName ? "border-destructive" : "border-border"
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[11px] text-destructive mt-1 ml-1">{errors.fullName}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="Email address"
                className={`w-full px-4 py-2.5 rounded-lg bg-card border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
                  touched.email && errors.email ? "border-destructive" : "border-border"
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-[11px] text-destructive mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="Password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-lg bg-card border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
                    touched.password && errors.password ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-destructive mt-1 ml-1">{errors.password}</p>
              )}

              {mode === "signup" && password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2"
                >
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        strengthPercent <= 40 ? "bg-destructive" : strengthPercent <= 80 ? "bg-warning" : "bg-success"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <span
                          key={rule.label}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                            passed
                              ? "bg-success/10 border-success/30 text-success"
                              : "bg-secondary border-border text-foreground-muted"
                          }`}
                        >
                          {passed && <Check size={8} className="inline mr-0.5 -mt-0.5" />}
                          {rule.label}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[11px] text-primary hover:underline disabled:opacity-60"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["DPDP Compliant", "SOC 2 Ready"].map((b) => (
              <span key={b} className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-foreground-muted border border-border font-medium">
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
