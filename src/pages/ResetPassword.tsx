import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForceLightTheme } from "@/hooks/useTheme";

export default function ResetPassword() {
  // Reached from an email link — always light, like the marketing site and auth.
  useForceLightTheme();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts a recovery session in URL hash; the client picks it up.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Fallback: if a session already exists from the URL, allow update.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="mkt-x min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-8">
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-10 w-10" />
          <span className="text-xl font-extrabold text-foreground">
            Osciva <span className="text-primary">AI</span>
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Set a new password</h1>
        <p className="text-sm text-foreground-muted mb-6">
          {ready ? "Choose a strong password to secure your account." : "Verifying recovery link…"}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              disabled={!ready || loading}
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            disabled={!ready || loading}
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
