import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, Armchair, Star, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

interface Stats { leads: number; bookings: number; pending: number; revenue: number; available: number; reviews: number; }
interface Daily { date: string; leads: number; bookings: number; }

const PLAN_PRICE: Record<string, number> = { monthly: 500, quarterly: 1350, halfyearly: 2500, yearly: 4800 };

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ leads: 0, bookings: 0, pending: 0, revenue: 0, available: 0, reviews: 0 });
  const [daily, setDaily] = useState<Daily[]>([]);

  useEffect(() => {
    const load = async () => {
      const [leadsR, bookingsR, pendingR, availR, revR, reviewsR] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("seats").select("*", { count: "exact", head: true }).eq("status", "available"),
        supabase.from("bookings").select("plan,status").eq("status", "confirmed"),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);
      const revenue = (revR.data ?? []).reduce((s, b) => s + (PLAN_PRICE[b.plan] ?? 0), 0);
      setStats({
        leads: leadsR.count ?? 0,
        bookings: bookingsR.count ?? 0,
        pending: pendingR.count ?? 0,
        available: availR.count ?? 0,
        reviews: reviewsR.count ?? 0,
        revenue,
      });

      // Daily for last 14 days
      const since = new Date(Date.now() - 13 * 24 * 3600 * 1000); since.setHours(0, 0, 0, 0);
      const [{ data: ld }, { data: bd }] = await Promise.all([
        supabase.from("leads").select("created_at").gte("created_at", since.toISOString()),
        supabase.from("bookings").select("created_at").gte("created_at", since.toISOString()),
      ]);
      const days: Daily[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(since.getTime() + i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        days.push({
          date: label,
          leads: (ld ?? []).filter((x) => x.created_at.startsWith(key)).length,
          bookings: (bd ?? []).filter((x) => x.created_at.startsWith(key)).length,
        });
      }
      setDaily(days);
    };
    load();
    const ch = supabase.channel("admin-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const cards = [
    { label: "Total Leads", value: stats.leads, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Bookings", value: stats.bookings, sub: `${stats.pending} pending`, icon: Calendar, color: "text-purple-600 bg-purple-50" },
    { label: "Revenue (confirmed)", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Seats Available", value: `${stats.available} / 50`, icon: Armchair, color: "text-amber-600 bg-amber-50" },
    { label: "Reviews", value: stats.reviews, icon: Star, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of your library.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <div className={`size-10 rounded-xl grid place-items-center ${c.color}`}><c.icon className="size-5" /></div>
            <p className="mt-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</p>
            {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <h3 className="font-semibold">Leads — last 14 days</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 270)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="oklch(0.55 0.22 280)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
          <h3 className="font-semibold">Bookings — last 14 days</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 270)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="bookings" fill="oklch(0.72 0.18 250)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
