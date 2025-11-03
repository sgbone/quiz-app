import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function err(res: VercelResponse, status: number, code: string, details?: any) {
  return res.status(status).json({ ok: false, code, details });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const SUPA_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPA_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPA_URL || !SUPA_SERVICE) return err(res, 500, "ENV_MISSING");

    const authHeader = (req.headers.authorization || "").trim();
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = m?.[1];
    if (!token) return err(res, 401, "MISSING_SUPABASE_TOKEN");

    const admin = createClient(SUPA_URL!, SUPA_SERVICE!);
    const { data: auth } = await admin.auth.getUser(token);
    const uid = auth?.user?.id;
    if (!uid) return err(res, 401, "INVALID_SUPABASE_TOKEN");

    const { data, error } = await admin
      .from("discord_connections")
      .select(
        "discord_id,username,discriminator,avatar,roles,updated_at,last_checked,expires_at"
      )
      .eq("user_id", uid)
      .maybeSingle();

    if (error) return err(res, 500, "DB_SELECT_FAILED", error.message);

    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    return err(res, 500, "UNHANDLED_EXCEPTION", e?.message || String(e));
  }
}
