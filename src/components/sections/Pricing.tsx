import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/site";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-secondary/30 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">Membership</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Plans that grow with you.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Honest pricing. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p, i) => (
            <div
              key={p.id}
              className={`relative p-7 rounded-2xl border transition-all duration-300 animate-fade-up flex flex-col ${
                p.highlight
                  ? "bg-card border-primary/40 shadow-elegant scale-[1.02]"
                  : "bg-card border-border shadow-soft hover:shadow-card hover:-translate-y-1"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gradient text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-elegant">
                  <Sparkles className="size-3" /> {p.badge}
                </div>
              )}
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">₹{p.price.toLocaleString("en-IN")}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-7 w-full rounded-full ${
                  p.highlight
                    ? "bg-brand-gradient text-primary-foreground shadow-elegant hover:opacity-95"
                    : ""
                }`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link to="/booking" search={{ plan: p.id }}>Start Membership</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
