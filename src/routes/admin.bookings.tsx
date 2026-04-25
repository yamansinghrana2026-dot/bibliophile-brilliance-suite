import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trash2, Phone, MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({ component: BookingsPage });

interface Booking { id: string; name: string; phone: string; email: string | null; seat_id: number | null; plan: string; status: string; created_at: string; seats: { label: string } | null; }

const COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data } = await supabase.from("bookings").select("*, seats(label)").order("created_at", { ascending: false });
    setItems((data as unknown as Booking[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking? Seat will be freed.")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  const filtered = filter === "all" ? items : items.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground">{items.length} total · manage seat reservations</p>
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-secondary text-xs">
          {["all", "pending", "confirmed", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full font-medium capitalize ${filter === f ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Seat</th><th className="text-left p-3">Plan</th><th className="text-left p-3">Status</th><th className="text-left p-3">When</th><th className="p-3 w-44"></th></tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3"><a href={`tel:${b.phone}`} className="hover:text-primary">{b.phone}</a></td>
                <td className="p-3 font-mono">{b.seats?.label ?? "—"}</td>
                <td className="p-3 capitalize">{b.plan}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[b.status]}`}>{b.status}</span></td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(b.created_at).toLocaleString("en-IN")}</td>
                <td className="p-3 flex gap-1 justify-end">
                  {b.status !== "confirmed" && <Button size="icon" variant="ghost" title="Confirm" onClick={() => setStatus(b.id, "confirmed")}><CheckCircle2 className="size-4 text-success" /></Button>}
                  {b.status !== "cancelled" && <Button size="icon" variant="ghost" title="Cancel" onClick={() => setStatus(b.id, "cancelled")}><XCircle className="size-4 text-destructive" /></Button>}
                  <Button asChild size="icon" variant="ghost" title="WhatsApp"><a href={waLink(`Hi ${b.name}, regarding your seat ${b.seats?.label ?? ""} at ${SITE.name}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /></a></Button>
                  <Button asChild size="icon" variant="ghost" title="Call"><a href={`tel:${b.phone}`}><Phone className="size-4" /></a></Button>
                  <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(b.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No bookings.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
