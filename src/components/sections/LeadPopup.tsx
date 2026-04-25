import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { waLink } from "@/lib/site";
import { toast } from "sonner";

const KEY = "tbl_lead_shown";

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    const t = setTimeout(() => { setOpen(true); sessionStorage.setItem(KEY, "1"); }, 12000);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.6 && !sessionStorage.getItem(KEY)) {
        setOpen(true); sessionStorage.setItem(KEY, "1");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 1 || phone.trim().length < 7) return toast.error("Please enter your name and phone.");
    setBusy(true);
    const { error } = await supabase.from("leads").insert({ name: name.trim(), phone: phone.trim(), source: "popup" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("We'll reach out shortly!");
    setOpen(false);
    window.open(waLink(`Hi! I'm ${name.trim()} (${phone.trim()}). I'd like to know about plans at The Bibliophile Library.`), "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground"><Sparkles className="size-4" /></div>
            <DialogTitle>Get a free trial day</DialogTitle>
          </div>
          <DialogDescription>Drop your details — we'll WhatsApp you the seat availability + a free trial day.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="ln">Name</Label><Input id="ln" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Your full name" /></div>
          <div><Label htmlFor="lp">Phone</Label><Input id="lp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} placeholder="10-digit mobile" /></div>
          <Button type="submit" disabled={busy} className="w-full h-11 rounded-full bg-brand-gradient text-primary-foreground shadow-elegant">{busy ? "Sending..." : "Get free trial day"}</Button>
          <p className="text-xs text-muted-foreground text-center">No spam. We'll only message about your trial.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
