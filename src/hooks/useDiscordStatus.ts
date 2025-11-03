import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export type DiscordData = {
  discord_id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  roles: string[] | null;
  updated_at?: string;
  last_checked?: string;
  expires_at?: number;
};

export function useDiscordStatus(auto = true) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiscordData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) throw new Error("Chưa đăng nhập");
      const r = await fetch("/api/discord-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.code || r.status);
      setData(j.data ?? null);
    } catch (e: any) {
      setError(e?.message || "failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshFromDiscord = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) throw new Error("Chưa đăng nhập");
      const r = await fetch("/api/discord-refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.code || r.status);
      setData(j.data ?? null);
    } catch (e: any) {
      setError(e?.message || "refresh_failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auto) return;
    load();
    const onFocus = () => load();
    const onVisible = () => document.visibilityState === "visible" && load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auto]);

  return { loading, data, error, load, refreshFromDiscord };
}
