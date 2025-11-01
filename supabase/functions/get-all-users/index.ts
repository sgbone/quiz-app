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
    const { adminKey } = await req.json();

    // 1. Kiểm tra Admin Key
    if (adminKey !== Deno.env.get("ADMIN_KEY")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized: Invalid admin key",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Tạo client quản trị
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
    );

    // 3. Lấy danh sách ID từ bảng `profiles`
    const { data, error } = await supabaseAdmin.from("profiles").select("id");
    if (error) throw error;

    const userIds = data.map((profile) => profile.id);

    return new Response(JSON.stringify({ success: true, userIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
