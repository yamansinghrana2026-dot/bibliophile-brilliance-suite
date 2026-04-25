export const SITE = {
  name: "The Bibliophile Library",
  tagline: "Najafgarh's Premium Study Sanctuary",
  phone: "+918860008053",
  phoneDisplay: "+91 88600 08053",
  whatsapp: "918860008053",
  email: "hello@bibliophilelibrary.in",
  address: "Najafgarh, New Delhi",
  hours: "6:00 AM – 11:00 PM • All days",
};

export const PLANS = [
  { id: "monthly", name: "Monthly", price: 500, period: "/ month", features: ["AC reading hall", "High-speed Wi-Fi", "Charging point", "Locker access"], highlight: false },
  { id: "quarterly", name: "Quarterly", price: 1350, period: "/ 3 months", features: ["Everything in Monthly", "Priority seat selection", "Save ₹150", "Free coffee Sundays"], highlight: true, badge: "Most Popular" },
  { id: "halfyearly", name: "Half-Yearly", price: 2500, period: "/ 6 months", features: ["Everything in Quarterly", "Reserved seat", "Save ₹500", "Mock test access"], highlight: false },
  { id: "yearly", name: "Yearly", price: 4800, period: "/ year", features: ["Everything in Half-Yearly", "Dedicated seat", "Save ₹1200", "1-on-1 mentorship"], highlight: false },
] as const;

export const waLink = (msg: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
