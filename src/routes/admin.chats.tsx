import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/chats")({ component: ChatLogs });

interface Log { id: string; session_id: string; role: string; content: string; created_at: string; }

function ChatLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("chat_logs").select("*").order("created_at", { ascending: false }).limit(200);
      setLogs((data as Log[]) ?? []);
    };
    load();
    const ch = supabase.channel("admin-chats").on("postgres_changes", { event: "*", schema: "public", table: "chat_logs" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Group by session_id
  const grouped = logs.reduce((acc, l) => {
    (acc[l.session_id] ??= []).push(l);
    return acc;
  }, {} as Record<string, Log[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chat Logs</h1>
        <p className="text-sm text-muted-foreground">Recent AI assistant conversations</p>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([sid, msgs]) => (
          <div key={sid} className="rounded-2xl bg-card border border-border shadow-soft p-5">
            <div className="text-xs font-mono text-muted-foreground mb-3">Session: {sid.slice(0, 8)}… · {new Date(msgs[0].created_at).toLocaleString("en-IN")}</div>
            <div className="space-y-2">
              {msgs.slice().reverse().map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-brand-gradient text-primary-foreground" : "bg-secondary"}`}>{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && <p className="text-center text-muted-foreground py-10">No chats yet.</p>}
      </div>
    </div>
  );
}
