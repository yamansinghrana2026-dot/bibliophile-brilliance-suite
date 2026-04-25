import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground shadow-elegant">
              <span className="text-sm font-bold">B</span>
            </div>
            <span>{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
            A premium study sanctuary in {SITE.address}. Quiet, focused, fully air-conditioned —
            built for serious learners chasing big goals.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" hash="pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/booking" className="hover:text-foreground">Book a Seat</Link></li>
            <li><Link to="/" hash="reviews" className="hover:text-foreground">Reviews</Link></li>
            <li><Link to="/" hash="gallery" className="hover:text-foreground">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="size-4" /> <a href={`tel:${SITE.phone}`} className="hover:text-foreground">{SITE.phoneDisplay}</a></li>
            <li className="flex items-center gap-2"><MessageCircle className="size-4" /> <a href={`https://wa.me/${SITE.whatsapp}`} className="hover:text-foreground">WhatsApp</a></li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> {SITE.email}</li>
            <li className="flex items-center gap-2"><MapPin className="size-4" /> {SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. Crafted with care.
      </div>
    </footer>
  );
}
