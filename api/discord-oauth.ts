import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function err(res: VercelResponse, status: number, code: string, details?: any) {
  if (details) console.error(`[${code}]`, details);
  return res.status(status).json({ ok: false, code, details });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return err(res, 405, "METHOD_NOT_ALLOWED");

    const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ENV_MISS =
      !SUPA_URL ||
      !SUPA_SERVICE ||
      !process.env.DISCORD_CLIENT_ID ||
      !process.env.DISCORD_CLIENT_SECRET ||
      !process.env.DISCORD_REDIRECT_URI ||
      !process.env.DISCORD_GUILD_ID;
    if (ENV_MISS) return err(res, 500, "ENV_MISSING");

    const { code } = (req.body || {}) as { code?: string };
    if (!code) return err(res, 400, "MISSING_CODE");

    const authHeader = (req.headers.authorization || "").trim();
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    const supaToken = m?.[1];
    if (!supaToken) return err(res, 401, "MISSING_SUPABASE_TOKEN");

    const admin = createClient(SUPA_URL!, SUPA_SERVICE!);
    const { data: auth, error: authErr } = await admin.auth.getUser(supaToken);
    if (authErr || !auth?.user?.id)
      return err(res, 401, "INVALID_SUPABASE_TOKEN", authErr?.message);
    const userId = auth.user.id;

    // 1) Exchange code -> token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok) {
      return err(
        res,
        400,
        "DISCORD_TOKEN_EXCHANGE_FAILED",
        tokenJson?.error_description || tokenJson?.error || tokenJson
      );
    }

    const { access_token, refresh_token, token_type, scope, expires_in } =
      tokenJson;
    const expires_at = Math.floor(Date.now() / 1000) + (expires_in ?? 3600);

    // 2) Lấy user Discord
    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const me = await meRes.json().catch(() => ({}));
    if (!meRes.ok || !me?.id) return err(res, 400, "DISCORD_ME_FAILED", me);

    // 3) Lấy roles trong guild
    const guildRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const member = await guildRes.json().catch(() => ({}));
    const roles: string[] = guildRes.ok ? member?.roles ?? [] : [];

    // 4) Lưu vào DB
    const payload = {
      user_id: userId,
      discord_id: me.id,
      username: me.username,
      discriminator: me.discriminator,
      avatar: me.avatar
        ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
        : null,
      roles,
      connected_at: new Date().toISOString(),

      access_token,
      refresh_token,
      token_type,
      scope,
      expires_at,
      updated_at: new Date().toISOString(),
      last_checked: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("discord_connections")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return err(res, 500, "DB_UPSERT_FAILED", error.message);

    return res.status(200).json({ ok: true, discordUser: data });
  } catch (e: any) {
    return err(res, 500, "UNHANDLED_EXCEPTION", e?.message || String(e));
  }
}
