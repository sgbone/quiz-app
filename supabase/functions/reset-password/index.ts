import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Kiểm tra "Chìa Khóa Bí Mật"
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { password: newPassword } = await req.json();
    if (!newPassword) throw new Error("Password not provided in body");

    // Tạo client với quyền service_role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 2. Cập nhật mật khẩu được gửi từ bot
    const { error: dbError } = await supabase
      .from("system_config")
      .update({ value: newPassword })
      .eq("key", "current_password");

    if (dbError) throw dbError;

    // 3. Không cần gửi webhook nữa, chỉ cần báo thành công
    return new Response(
      JSON.stringify({ message: "Password updated successfully by bot!" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
