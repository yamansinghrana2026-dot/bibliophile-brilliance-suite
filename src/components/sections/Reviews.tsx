import { useEffect, useState } from "react";
import { Star, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Review { id: string; name: string; rating: number; comment: string; created_at: string; }

export function Reviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("reviews").select("id,name,rating,comment,created_at").eq("approved", true).order("created_at", { ascending: false }).limit(9);
    setItems((data as Review[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("reviews-public").on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <section id="reviews" className="py-24 sm:py-32 bg-background scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Loved by students</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">Real stories. Real results.</h2>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full"><Plus className="size-4 mr-1" /> Write a review</Button>
            </DialogTrigger>
            <ReviewModal onDone={() => { setOpen(false); toast.success("Thanks! Your review will appear after approval."); }} />
          </Dialog>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((r, i) => (
            <div key={r.id} className="p-7 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`size-4 ${j < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground leading-relaxed">"{r.comment}"</p>
              <p className="mt-5 text-sm font-semibold">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewModal({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 1 || comment.trim().length < 5) return toast.error("Please fill your name and a longer comment.");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({ name: name.trim(), rating, comment: comment.trim(), approved: false });
    setBusy(false);
    if (error) return toast.error(error.message);
    onDone();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Share your experience</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="rn">Your name</Label><Input id="rn" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></div>
        <div>
          <Label>Rating</Label>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button type="button" key={i} onClick={() => setRating(i + 1)}>
                <Star className={`size-7 transition-transform hover:scale-110 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
              </button>
            ))}
          </div>
        </div>
        <div><Label htmlFor="rc">Comment</Label><Textarea id="rc" value={comment} onChange={(e) => setComment(e.target.value)} required minLength={5} maxLength={500} rows={4} /></div>
        <Button type="submit" disabled={busy} className="w-full bg-brand-gradient text-primary-foreground">{busy ? "Submitting..." : "Submit review"}</Button>
      </form>
    </DialogContent>
  );
}
