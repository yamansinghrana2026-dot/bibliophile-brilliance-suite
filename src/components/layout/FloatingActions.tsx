import { SITE, waLink } from "@/lib/site";
import { Phone, MessageCircle } from "lucide-react";

export function FloatingActions() {
  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col gap-3">
      <a
        href={waLink("Hi! I'd like to know more about The Bibliophile Library.")}
        target="_blank"
        rel="noreferrer"
        className="size-14 rounded-full bg-[oklch(0.7_0.18_150)] text-white grid place-items-center shadow-elegant hover:scale-110 transition-transform animate-pulse-soft"
        aria-label="WhatsApp"
      >
        <MessageCircle className="size-6" />
      </a>
      <a
        href={`tel:${SITE.phone}`}
        className="size-14 rounded-full bg-brand-gradient text-primary-foreground grid place-items-center shadow-elegant hover:scale-110 transition-transform"
        aria-label="Call"
      >
        <Phone className="size-6" />
      </a>
    </div>
  );
}
