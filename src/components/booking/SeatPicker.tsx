import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLANS, waLink } from "@/lib/site";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface Seat { id: number; label: string; status: string; }

export function SeatPicker({ defaultPlan }: { defaultPlan?: string }) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>(defaultPlan || "quarterly");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string; seat: string } | null>(null);

  const load = async () => {
    const { data } = await supabase.from("seats").select("id,label,status").order("id");
    setSeats((data as Seat[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("seats-picker").on("postgres_changes", { event: "*", schema: "public", table: "seats" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return toast.error("Please pick a seat first.");
    if (name.trim().length < 1 || phone.trim().length < 7) return toast.error("Please enter your name and phone.");
    setBusy(true);
    const seatLabel = seats.find((s) => s.id === selected)?.label ?? "";
    const { error } = await supabase.from("bookings").insert({
      name: name.trim(), phone: phone.trim(), email: email.trim() || null,
      seat_id: selected, plan, status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone({ name: name.trim(), seat: seatLabel });
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-fade-up">
        <div className="size-16 rounded-full bg-success/15 grid place-items-center mx-auto"><CheckCircle2 className="size-8 text-success" /></div>
        <h2 className="mt-6 text-3xl font-semibold">Seat reserved, {done.name}! 🎉</h2>
        <p className="mt-3 text-muted-foreground">Seat <span className="font-semibold text-foreground">{done.seat}</span> is held for you. Our team will confirm via WhatsApp shortly.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="rounded-full bg-brand-gradient text-primary-foreground">
            <a href={waLink(`Hi! I just booked seat ${done.seat} (${plan} plan). My name is ${done.name}.`)} target="_blank" rel="noreferrer">
              Confirm on WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full"><a href="/">Back to home</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr,420px] gap-10">
      {/* Seat map */}
      <div>
        <div className="rounded-2xl bg-card border border-border shadow-soft p-6 sm:p-8">
          <div className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">Reading Hall — Front</div>
          <div className="mt-2 mx-auto h-1.5 w-3/4 rounded-full bg-brand-gradient opacity-60" />

          <div className="mt-8 grid grid-cols-10 gap-2 sm:gap-3">
            {seats.map((s) => {
              const isSel = selected === s.id;
              const isAvail = s.status === "available";
              return (
                <button
                  key={s.id}
                  onClick={() => isAvail && setSelected(s.id)}
                  disabled={!isAvail}
                  title={s.label}
                  className={`aspect-square rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                    isSel
                      ? "bg-primary text-primary-foreground scale-110 shadow-elegant"
                      : isAvail
                      ? "bg-success/15 text-success hover:bg-success/25"
                      : "bg-destructive/15 text-destructive cursor-not-allowed opacity-70"
                  }`}
                >
                  {s.label.replace("S", "")}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-5 text-xs text-muted-foreground">
            <Legend color="bg-success/40" label="Available" />
            <Legend color="bg-destructive/40" label="Booked" />
            <Legend color="bg-primary" label="Selected" />
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="rounded-2xl bg-card border border-border shadow-soft p-6 sm:p-8 space-y-4 h-fit lg:sticky lg:top-24">
        <h3 className="text-xl font-semibold">Your details</h3>
        <p className="text-sm text-muted-foreground -mt-1">Selected seat: <span className="font-semibold text-foreground">{selected ? seats.find((s) => s.id === selected)?.label : "—"}</span></p>
        <div><Label htmlFor="bn">Full name</Label><Input id="bn" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></div>
        <div><Label htmlFor="bp">Phone (WhatsApp)</Label><Input id="bp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} /></div>
        <div><Label htmlFor="be">Email (optional)</Label><Input id="be" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></div>
        <div>
          <Label>Plan</Label>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLANS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price.toLocaleString("en-IN")} {p.period}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={busy || !selected} className="w-full h-11 rounded-full bg-brand-gradient text-primary-foreground shadow-elegant">{busy ? "Reserving..." : "Reserve my seat"}</Button>
        <p className="text-xs text-muted-foreground text-center">Manual confirmation via WhatsApp. No payment required now.</p>
      </form>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-1.5"><span className={`size-3 rounded ${color}`} />{label}</div>;
}
