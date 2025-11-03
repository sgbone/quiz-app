// api/self-check.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const env = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
      DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || null,
      DISCORD_GUILD_ID: !!process.env.DISCORD_GUILD_ID,
    };

    // Optional: kiểm tra auth token nếu client gửi kèm
    let userId: string | null = null;
    const authHeader = (req.headers.authorization || "").trim();
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (m?.[1]) {
      const admin = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data } = await admin.auth.getUser(m[1]);
      userId = data?.user?.id ?? null;
    }

    return res.status(200).json({ ok: true, env, userId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
