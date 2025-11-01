import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Xử lý yêu cầu "thăm dò" (preflight) của trình duyệt
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { adminKey } = await req.json();

    // 1. Kiểm tra Admin Key
    if (adminKey !== Deno.env.get("ADMIN_KEY")) {
      return new Response(
        JSON.stringify({ success: false, message: "Sai Admin Key!" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. Tạo client với quyền admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Lấy danh sách users
    const { data, error } = await supabaseAdmin.from("profiles").select("id");
    if (error) throw error;

    const userIds = data.map((profile) => profile.id);

    return new Response(JSON.stringify({ success: true, userIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
