import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = { loading: boolean; userId: string | null; isAdmin: boolean };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ loading: true, userId: null, isAdmin: false });

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (uid: string | null) => {
      if (!uid) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      return !!data;
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setState((s) => ({ ...s, userId: uid }));
      // Defer admin check to avoid deadlock
      setTimeout(async () => {
        const isAdmin = await checkAdmin(uid);
        if (mounted) setState({ loading: false, userId: uid, isAdmin });
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      const isAdmin = await checkAdmin(uid);
      if (mounted) setState({ loading: false, userId: uid, isAdmin });
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return state;
}
