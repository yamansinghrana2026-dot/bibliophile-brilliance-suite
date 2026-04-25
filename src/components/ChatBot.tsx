import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChat } from "@/server/chat";

interface Msg { role: "user" | "assistant"; content: string; }

const sessionId = () => {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("tbl_chat_sid");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("tbl_chat_sid", id); }
  return id;
};

const QUICK = ["Fees & plans?", "Are seats available?", "Library timings?"];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Biblio 📚 Ask me about plans, seats, or timings — happy to help!" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await sendChat({ data: { sessionId: sessionId(), messages: next.slice(-12) } });
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: e instanceof Error ? e.message : "Network error. Please try WhatsApp." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-brand-gradient text-primary-foreground shadow-elegant grid place-items-center hover:scale-110 transition-transform animate-pulse-soft"
        aria-label="Open chat"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))] glass shadow-elegant rounded-3xl flex flex-col overflow-hidden animate-fade-up">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card/60">
            <div className="size-9 rounded-xl bg-brand-gradient grid place-items-center text-primary-foreground"><Sparkles className="size-4" /></div>
            <div>
              <p className="text-sm font-semibold">Biblio · AI Assistant</p>
              <p className="text-xs text-muted-foreground">Replies instantly</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user" ? "bg-brand-gradient text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                }`}>{m.content}</div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-card border border-border flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-2 rounded-full bg-muted-foreground/60 animate-pulse-soft" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {msgs.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition-colors">{q}</button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t border-border flex gap-2 bg-card/60">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              maxLength={500}
              className="flex-1 px-4 h-10 rounded-full bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" className="size-10 rounded-full bg-brand-gradient text-primary-foreground" disabled={busy || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
