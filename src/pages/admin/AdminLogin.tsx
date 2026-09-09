import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { signIn } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/Logo";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-8 shadow-card ring-1 ring-plum/5">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-11 w-11" />
          <h1 className="mt-4 font-serif text-xl font-medium text-plum">Staff Sign In</h1>
          <p className="mt-1 text-sm text-ink/55">Manage appointments for BRD Hospital.</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-6 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
            Backend isn't connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to
            .env.local (see .env.example), then reload.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-ink/60">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-plum/15 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
              placeholder="you@brdhospital.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-ink/60">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-plum/15 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            icon={<Lock size={16} />}
            iconPosition="left"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
