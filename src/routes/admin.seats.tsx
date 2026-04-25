import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCw } from "lucide-react";

export const Route = createFileRoute("/admin/seats")({ component: SeatsPage });

interface Seat { id: number; label: string; status: string; }

function SeatsPage() {
  const [seats, setSeats] = useState<Seat[]>([]);

  const load = async () => {
    const { data } = await supabase.from("seats").select("*").order("id");
    setSeats((data as Seat[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-seats").on("postgres_changes", { event: "*", schema: "public", table: "seats" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const toggle = async (s: Seat) => {
    const next = s.status === "available" ? "blocked" : "available";
    const { error } = await supabase.from("seats").update({ status: next, updated_at: new Date().toISOString() }).eq("id", s.id);
    if (error) return toast.error(error.message);
  };

  const resetAll = async () => {
    if (!confirm("Reset all unbooked seats to available? (Won't touch booked seats)")) return;
    const { error } = await supabase.from("seats").update({ status: "available", updated_at: new Date().toISOString() }).eq("status", "blocked");
    if (error) return toast.error(error.message);
    toast.success("Reset done");
  };

  const counts = {
    available: seats.filter((s) => s.status === "available").length,
    booked: seats.filter((s) => s.status === "booked").length,
    blocked: seats.filter((s) => s.status === "blocked").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seats</h1>
          <p className="text-sm text-muted-foreground">Tap to toggle blocked / available. Booked seats are managed via Bookings page.</p>
        </div>
        <Button variant="outline" onClick={resetAll}><RotateCw className="size-4 mr-2" /> Reset blocked → available</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Available" value={counts.available} className="bg-emerald-50 text-emerald-700" />
        <Stat label="Booked" value={counts.booked} className="bg-rose-50 text-rose-700" />
        <Stat label="Blocked" value={counts.blocked} className="bg-amber-50 text-amber-700" />
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft p-6">
        <div className="grid grid-cols-10 gap-2">
          {seats.map((s) => {
            const cls = s.status === "available" ? "bg-success/15 text-success hover:bg-success/25" : s.status === "booked" ? "bg-destructive/15 text-destructive cursor-not-allowed" : "bg-warning/20 text-warning-foreground hover:bg-warning/30";
            return (
              <button key={s.id} onClick={() => s.status !== "booked" && toggle(s)} disabled={s.status === "booked"} className={`aspect-square rounded-lg text-xs font-medium transition-all ${cls}`}>{s.label.replace("S", "")}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
