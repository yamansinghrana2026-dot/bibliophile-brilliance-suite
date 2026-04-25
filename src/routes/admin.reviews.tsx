import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsAdmin });

interface Review { id: string; name: string; rating: number; comment: string; approved: boolean; created_at: string; }

function ReviewsAdmin() {
  const [items, setItems] = useState<Review[]>([]);

  const load = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setItems((data as Review[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-reviews").on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Approved");
  };
  const remove = async (id: string) => {
    if (!confirm("Delete review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">{items.filter((i) => !i.approved).length} pending approval</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((r) => (
          <div key={r.id} className={`rounded-2xl bg-card border p-5 shadow-soft ${r.approved ? "border-border" : "border-amber-300"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{r.name}</p>
                <div className="flex mt-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}
                </div>
              </div>
              {!r.approved && <span className="text-[10px] uppercase tracking-wide font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Pending</span>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">"{r.comment}"</p>
            <div className="mt-4 flex gap-2">
              {!r.approved && <Button size="sm" onClick={() => approve(r.id)} className="bg-success text-success-foreground"><Check className="size-4 mr-1" /> Approve</Button>}
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-10 col-span-full">No reviews yet.</p>}
      </div>
    </div>
  );
}
