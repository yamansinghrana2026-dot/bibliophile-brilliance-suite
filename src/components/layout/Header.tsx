import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/booking", label: "Book a Seat" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="size-8 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground shadow-elegant">
            <span className="text-sm font-bold">B</span>
          </div>
          <span className="hidden sm:inline text-foreground">{SITE.name}</span>
          <span className="sm:hidden text-foreground">Bibliophile</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeProps={{ className: "px-4 py-2 rounded-full text-sm font-medium text-foreground bg-secondary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <a href={`tel:${SITE.phone}`}>Call</a>
          </Button>
          <Button asChild size="sm" className="bg-brand-gradient text-primary-foreground shadow-elegant hover:opacity-95">
            <Link to="/booking">Book Seat</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={`tel:${SITE.phone}`}>Call</a>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-brand-gradient text-primary-foreground">
                <Link to="/booking" onClick={() => setOpen(false)}>Book Seat</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
