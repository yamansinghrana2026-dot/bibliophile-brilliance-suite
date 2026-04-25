import { Wifi, Snowflake, ShieldCheck, Coffee, Lock, Clock } from "lucide-react";

const FEATURES = [
  { icon: Snowflake, title: "Fully AC reading hall", desc: "Climate controlled year-round for distraction-free deep work." },
  { icon: Wifi, title: "Blazing-fast Wi-Fi", desc: "Fiber connection with backup, perfect for online classes." },
  { icon: Lock, title: "Personal lockers", desc: "Keep your books and laptop safe between sessions." },
  { icon: Coffee, title: "Tea & coffee corner", desc: "Stay sharp with unlimited refreshments included." },
  { icon: ShieldCheck, title: "CCTV & secure entry", desc: "Monitored 24/7 with biometric access for members." },
  { icon: Clock, title: "Open 6 AM – 11 PM", desc: "Early-bird or night-owl, your timing always works." },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">Why students love it</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Built for serious focus.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Every detail is engineered to help you study longer, learn deeper, and achieve more.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-7 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="size-12 rounded-xl bg-accent text-accent-foreground grid place-items-center mb-5 group-hover:bg-brand-gradient group-hover:text-primary-foreground transition-colors">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
