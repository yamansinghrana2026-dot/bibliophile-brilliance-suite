import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

interface Lead { id: string; name: string; phone: string; source: string | null; notes: string | null; created_at: string; }

function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setItems((data as Lead[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-leads").on("postgres_changes", { event: "*", schema: "public", table: "leads" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">{items.length} captured leads</p>
      </div>
      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Source</th><th className="text-left p-3 hidden sm:table-cell">When</th><th className="p-3 w-32"></th></tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-secondary/30">
                <td className="p-3 font-medium">{l.name}</td>
                <td className="p-3"><a href={`tel:${l.phone}`} className="hover:text-primary">{l.phone}</a></td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">{l.source ?? "—"}</span></td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{new Date(l.created_at).toLocaleString("en-IN")}</td>
                <td className="p-3 flex gap-1 justify-end">
                  <Button asChild size="icon" variant="ghost"><a href={`tel:${l.phone}`}><Phone className="size-4" /></a></Button>
                  <Button asChild size="icon" variant="ghost"><a href={waLink(`Hi ${l.name}, this is ${SITE.name}.`)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" /></a></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
