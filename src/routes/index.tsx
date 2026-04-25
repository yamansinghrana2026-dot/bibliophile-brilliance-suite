import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { ChatBot } from "@/components/ChatBot";
import { Hero } from "@/components/sections/Hero";
import { UrgencyBar } from "@/components/sections/UrgencyBar";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Gallery } from "@/components/sections/Gallery";
import { LeadPopup } from "@/components/sections/LeadPopup";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: "Premium AC study library in Najafgarh, New Delhi. Book your seat today. Plans from ₹500/month. High-speed Wi-Fi, lockers, focused community." },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
      { property: "og:description", content: "Najafgarh's premium study sanctuary. AC, Wi-Fi, lockers — built for serious learners." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <UrgencyBar />
        <Features />
        <Pricing />
        <Reviews />
        <Gallery />
      </main>
      <Footer />
      <FloatingActions />
      <ChatBot />
      <LeadPopup />
    </div>
  );
}
