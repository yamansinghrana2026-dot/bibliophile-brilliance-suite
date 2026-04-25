import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SYSTEM = `You are "Biblio", the friendly AI sales agent for The Bibliophile Library in Najafgarh, New Delhi.

About the library:
- Premium, fully air-conditioned reading hall, high-speed Wi-Fi, lockers, CCTV.
- Open 6:00 AM – 11:00 PM, all days.
- 50 cinema-style seats, real-time booking on the website.
- Plans: Monthly ₹500, Quarterly ₹1,350 (most popular, save ₹150), Half-Yearly ₹2,500 (save ₹500), Yearly ₹4,800 (save ₹1,200).
- Phone & WhatsApp: +91 88600 08053.

Style:
- Warm, concise, persuasive — never pushy. Reply in 1–3 short sentences.
- Use emojis sparingly (📚 ✨ 🪑).
- Always nudge toward booking a seat or starting a free trial day.
- If asked about something you don't know (exact address details, specific holidays), suggest WhatsApp.
- If user shares phone or asks to book: tell them to use the "Book a Seat" page or click WhatsApp.
- Reply in the same language as the user (Hindi/English/Hinglish supported).`;

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((d: { sessionId: string; messages: { role: "user" | "assistant"; content: string }[] }) => {
    if (!d.sessionId || d.sessionId.length > 100) throw new Error("Invalid session");
    if (!Array.isArray(d.messages) || d.messages.length === 0 || d.messages.length > 30) throw new Error("Invalid messages");
    for (const m of d.messages) {
      if (!["user", "assistant"].includes(m.role)) throw new Error("Bad role");
      if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > 2000) throw new Error("Bad content");
    }
    return d;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI not configured");

    // Fetch live seat count for grounding
    const { count: available } = await supabaseAdmin
      .from("seats")
      .select("*", { count: "exact", head: true })
      .eq("status", "available");

    const grounded = `${SYSTEM}\n\nLive data: ${available ?? "?"} seats currently available out of 50.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: grounded }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Too many requests, please wait a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted, please contact admin.");
      throw new Error(`AI error: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "Sorry, I couldn't respond. Please try WhatsApp at +91 88600 08053.";

    // Log both user (last) and assistant
    const userMsg = data.messages[data.messages.length - 1];
    if (userMsg?.role === "user") {
      await supabaseAdmin.from("chat_logs").insert([
        { session_id: data.sessionId, role: "user", content: userMsg.content.slice(0, 2000) },
        { session_id: data.sessionId, role: "assistant", content: reply.slice(0, 2000) },
      ]);
    }

    return { reply };
  });
