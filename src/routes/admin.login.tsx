import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Sign In" }, { name: "robots", content: "noindex" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle();
        if (role) navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (data.user) toast.success("Account created. Ask the system owner to grant you admin access.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!role) return toast.error("This account is not an admin. Contact the system owner.");
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-hero p-4">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-elegant p-8 animate-fade-up">
        <div className="size-12 rounded-2xl bg-brand-gradient grid place-items-center text-primary-foreground mb-5"><Sparkles className="size-5" /></div>
        <h1 className="text-2xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create admin account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bibliophile admin dashboard</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label htmlFor="ae">Email</Label><Input id="ae" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label htmlFor="ap">Password</Label><Input id="ap" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={busy} className="w-full h-11 rounded-full bg-brand-gradient text-primary-foreground">{busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>

        <button onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))} className="mt-5 w-full text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
        </button>

        <div className="mt-6 p-3 rounded-xl bg-accent/50 text-xs text-muted-foreground">
          <strong className="text-foreground">First time?</strong> Sign up, then ask the database owner to add your user_id to <code className="font-mono">user_roles</code> with role <code className="font-mono">admin</code>.
        </div>
      </div>
    </div>
  );
}
