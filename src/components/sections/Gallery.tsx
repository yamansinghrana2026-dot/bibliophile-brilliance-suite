import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GalleryItem { id: string; image_url: string; caption: string | null; }

const FALLBACK: GalleryItem[] = [
  { id: "f1", image_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80", caption: "Quiet reading hall" },
  { id: "f2", image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80", caption: "Books & focus" },
  { id: "f3", image_url: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80", caption: "Dedicated desks" },
  { id: "f4", image_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80", caption: "Calm atmosphere" },
  { id: "f5", image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80", caption: "Open shelves" },
  { id: "f6", image_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80", caption: "Study with us" },
];

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("gallery").select("id,image_url,caption").order("sort_order", { ascending: true });
      setItems(data && data.length > 0 ? (data as GalleryItem[]) : FALLBACK);
    })();
  }, []);

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-secondary/30 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">Gallery</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">A look inside.</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {items.map((g, i) => (
            <button
              key={g.id}
              onClick={() => setActive(g)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-soft hover:shadow-elegant transition-all animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <img src={g.image_url} alt={g.caption ?? "Gallery"} loading="lazy" className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {g.caption && <span className="absolute bottom-3 left-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{g.caption}</span>}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
          {active && (
            <div className="relative">
              <img src={active.image_url} alt={active.caption ?? ""} className="w-full rounded-2xl" />
              <button onClick={() => setActive(null)} className="absolute top-3 right-3 size-9 rounded-full glass grid place-items-center"><X className="size-4" /></button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
