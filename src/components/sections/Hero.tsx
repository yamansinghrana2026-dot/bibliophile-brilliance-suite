import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Star, Users, Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 size-[40rem] rounded-full bg-[oklch(0.78_0.16_280/0.35)] blur-3xl animate-blob" />
        <div className="absolute top-40 -right-40 size-[36rem] rounded-full bg-[oklch(0.78_0.16_230/0.3)] blur-3xl animate-blob [animation-delay:-4s]" />
        <div className="absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-[oklch(0.85_0.12_320/0.25)] blur-3xl animate-blob [animation-delay:-8s]" />
      </div>

      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-32 left-[12%] size-3 rounded-full bg-primary/40 animate-float" />
        <div className="absolute top-52 right-[18%] size-2 rounded-full bg-primary/60 animate-float-slow [animation-delay:-2s]" />
        <div className="absolute bottom-40 left-[22%] size-4 rounded-full bg-primary/30 animate-float [animation-delay:-3s]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass shadow-soft text-xs font-medium text-foreground/80 animate-fade-up">
          <Sparkles className="size-3.5 text-primary" />
          Najafgarh's #1 rated study library
        </div>

        <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground animate-fade-up [animation-delay:80ms]">
          Where focus
          <br />
          becomes <span className="text-gradient">a habit.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed animate-fade-up [animation-delay:160ms]">
          Premium AC reading hall, high-speed Wi-Fi, dedicated seats, and a focused community.
          Built for UPSC, SSC, NEET, JEE & serious learners in {`Najafgarh`}.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up [animation-delay:240ms]">
          <Button asChild size="lg" className="bg-brand-gradient text-primary-foreground shadow-elegant hover:shadow-glow hover:opacity-95 transition-all rounded-full px-7 h-12 text-base group">
            <Link to="/booking">
              Book Your Seat
              <ArrowRight className="ml-1 size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 text-base bg-card/60 backdrop-blur">
            <Link to="/" hash="pricing">View Plans</Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm animate-fade-up [animation-delay:320ms]">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold">4.9</span>
            <span className="text-muted-foreground">rating</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" /> <span className="font-semibold text-foreground">100+</span> students
          </div>
        </div>
      </div>
    </section>
  );
}
