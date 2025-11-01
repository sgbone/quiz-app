import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from generate-daily-pass function!");

serve(async (req) => {
  try {
    console.log("--- New daily pass generation triggered ---");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    console.log("Admin client created.");

    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("New password generated:", newPassword);

    const { error: dbError } = await supabaseAdmin
      .from("system_config")
      .update({ value: newPassword })
      .eq("key", "current_password");

    if (dbError) throw new Error(`Database update failed: ${dbError.message}`);
    console.log("Password updated in database.");

    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL")!;
    const content = `🔑 (Tự động) Mật khẩu mới hôm nay là: **${newPassword}**`;

    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!discordResponse.ok) throw new Error("Failed to send Discord webhook.");
    console.log("Webhook sent to Discord.");

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("--- FUNCTION FAILED ---", error.message);
    // Cố gắng gửi thông báo lỗi qua Discord
    try {
      const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL")!;
      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 Lỗi tự động reset mật khẩu: ${error.message}`,
        }),
      });
    } catch (discordError) {
      console.error(
        "Failed to send error notification to Discord:",
        discordError
      );
    }
    return new Response(error.message, { status: 500 });
  }
});
