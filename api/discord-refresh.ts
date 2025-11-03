import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function E(res: VercelResponse, s: number, code: string, details?: any) {
  if (details) console.error(`[${code}]`, details);
  return res.status(s).json({ ok: false, code, details });
}

async function exchangeRefresh(refresh_token: string) {
  const r = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(j?.error_description || j?.error || "refresh_failed");
  return j as {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    scope?: string;
    expires_in?: number;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return E(res, 405, "METHOD_NOT_ALLOWED");

    const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const GUILD_ID = process.env.DISCORD_GUILD_ID;
    if (!SUPA_URL || !SUPA_SERVICE || !GUILD_ID)
      return E(res, 500, "ENV_MISSING");

    const authHeader = (req.headers.authorization || "").trim();
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = m?.[1];
    if (!token) return E(res, 401, "MISSING_SUPABASE_TOKEN");

    const admin = createClient(SUPA_URL!, SUPA_SERVICE!);
    const { data: auth } = await admin.auth.getUser(token);
    const uid = auth?.user?.id;
    if (!uid) return E(res, 401, "INVALID_SUPABASE_TOKEN");

    const { data: rec, error: selErr } = await admin
      .from("discord_connections")
      .select("discord_id,access_token,refresh_token,expires_at")
      .eq("user_id", uid)
      .single();

    if (selErr || !rec) return E(res, 404, "NOT_LINKED");

    let accessToken: string | null = rec.access_token;
    const now = Math.floor(Date.now() / 1000);
    const expired =
      !accessToken || !rec.expires_at || rec.expires_at - now < 60;

    if (expired) {
      if (!rec.refresh_token) return E(res, 400, "NO_REFRESH_TOKEN");
      const t = await exchangeRefresh(rec.refresh_token);
      accessToken = t.access_token;
      const expires_at = Math.floor(Date.now() / 1000) + (t.expires_in ?? 3600);

      await admin
        .from("discord_connections")
        .update({
          access_token: t.access_token,
          refresh_token: t.refresh_token ?? rec.refresh_token,
          token_type: t.token_type,
          scope: t.scope,
          expires_at,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", uid);
    }

    const memberRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const member = await memberRes.json().catch(() => ({}));
    if (!memberRes.ok) return E(res, 400, "DISCORD_MEMBER_FAILED", member);

    const roles: string[] = member.roles ?? [];

    const { data, error: upErr } = await admin
      .from("discord_connections")
      .update({
        roles,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", uid)
      .select(
        "discord_id,username,discriminator,avatar,roles,last_checked,updated_at"
      )
      .single();

    if (upErr) return E(res, 500, "DB_UPDATE_FAILED", upErr.message);

    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    return E(res, 500, "UNHANDLED_EXCEPTION", e?.message || String(e));
  }
}
