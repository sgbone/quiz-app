import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // Tạo Supabase client với service_role key để có toàn quyền
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Tạo mật khẩu ngẫu nhiên (6 số)
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Cập nhật mật khẩu mới vào database
    const { error: dbError } = await supabase
      .from("system_config")
      .update({ value: newPassword })
      .eq("key", "current_password");

    if (dbError) throw dbError;

    // 3. Gửi thông báo đến Discord
    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL")!;
    const content = `🔑 Mật khẩu làm bài mới hôm nay là: **${newPassword}**`;

    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content }),
    });

    return new Response("Password reset successfully!", { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
