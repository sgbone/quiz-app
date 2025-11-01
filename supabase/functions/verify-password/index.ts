import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Luôn xử lý preflight request cho CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password: userPassword } = await req.json();
    if (!userPassword) {
      throw new Error("Password not provided in request body");
    }

    // Tạo client quản trị để có quyền đọc bảng `system_config` một cách an toàn
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
    );

    // Lấy mật khẩu đúng từ database
    const { data, error } = await supabaseAdmin
      .from("system_config")
      .select("value")
      .eq("key", "current_password")
      .single();

    if (error) {
      throw error;
    }

    // So sánh mật khẩu
    const isValid = data.value === userPassword;

    // Trả về kết quả
    return new Response(JSON.stringify({ valid: isValid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
