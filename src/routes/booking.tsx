import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { ChatBot } from "@/components/ChatBot";
import { SeatPicker } from "@/components/booking/SeatPicker";
import { z } from "zod";

const search = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/booking")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Book a Seat — The Bibliophile Library" },
      { name: "description", content: "Pick your seat in the premium AC reading hall. Real-time availability, instant confirmation via WhatsApp." },
    ],
  }),
  component: Booking,
});

function Booking() {
  const { plan } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-up">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Reserve your seat</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">Pick your spot.</h1>
            <p className="mt-3 text-muted-foreground">Real-time availability. Hold a seat now — confirm on WhatsApp.</p>
          </div>
          <SeatPicker defaultPlan={plan} />
        </div>
      </main>
      <Footer />
      <FloatingActions />
      <ChatBot />
    </div>
  );
}
