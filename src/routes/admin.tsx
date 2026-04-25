import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Calendar, Armchair, Star, Image, MessageSquare, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Bibliophile" }, { name: "robots", content: "noindex" }] }),
  component: AdminShell,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/seats", label: "Seats", icon: Armchair },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/chats", label: "Chat Logs", icon: MessageSquare },
];

function AdminShell() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && (!auth.userId || !auth.isAdmin)) {
      navigate({ to: "/admin/login" });
    }
  }, [auth, navigate]);

  if (auth.loading || !auth.userId || !auth.isAdmin) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="px-6 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground"><span className="text-sm font-bold">B</span></div>
            <span className="text-sm">Bibliophile Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              activeProps={{ className: "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground" }}
              activeOptions={{ exact: n.exact }}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm">Admin</span>
          <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}><LogOut className="size-4" /></Button>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-x-auto"><Outlet /></main>
        <nav className="md:hidden border-t border-border bg-card grid grid-cols-7 text-[10px]">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="py-2 flex flex-col items-center gap-1 text-muted-foreground" activeProps={{ className: "py-2 flex flex-col items-center gap-1 text-primary" }} activeOptions={{ exact: n.exact }}>
              <n.icon className="size-4" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
