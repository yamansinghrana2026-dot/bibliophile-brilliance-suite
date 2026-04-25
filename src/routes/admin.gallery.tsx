import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/gallery")({ component: GalleryAdmin });

interface Item { id: string; image_url: string; caption: string | null; sort_order: number | null; }

function GalleryAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from("gallery").select("*").order("sort_order", { ascending: true });
    setItems((data as Item[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
    if (upErr) { setBusy(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery").insert({ image_url: pub.publicUrl, caption: caption.trim() || null, sort_order: items.length });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCaption(""); if (fileRef.current) fileRef.current.value = "";
    toast.success("Uploaded");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-sm text-muted-foreground">Showcase your space.</p>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft p-5 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full"><label className="text-sm font-medium">Caption (optional)</label><Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Reading hall — morning" /></div>
        <div>
          <Button onClick={() => fileRef.current?.click()} disabled={busy} className="bg-brand-gradient text-primary-foreground"><Upload className="size-4 mr-2" /> {busy ? "Uploading..." : "Upload image"}</Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-soft">
            <img src={it.image_url} alt={it.caption ?? ""} className="size-full object-cover" />
            <button onClick={() => remove(it.id)} className="absolute top-2 right-2 size-9 rounded-full bg-destructive/90 text-destructive-foreground grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-4" /></button>
            {it.caption && <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 text-white text-xs">{it.caption}</div>}
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-10">No images yet.</p>}
      </div>
    </div>
  );
}
