import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

export function UrgencyBar() {
  const [available, setAvailable] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("seats")
        .select("*", { count: "exact", head: true })
        .eq("status", "available");
      setAvailable(count ?? 0);
    };
    load();
    const ch = supabase
      .channel("seats-urgency")
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (available === null) return null;
  const low = available <= 15;

  return (
    <div className={`relative overflow-hidden ${low ? "bg-warning/15" : "bg-success/10"} border-y border-border`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm font-medium">
        {low && <AlertTriangle className="size-4 text-warning-foreground" />}
        <span>
          {low ? "⚠ Only" : "✓"} <span className="font-bold">{available}</span>{" "}
          {low ? "seats left" : "seats available right now"} — secure yours before they're gone.
        </span>
      </div>
    </div>
  );
}
