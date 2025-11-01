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
    const { adminKey, notificationsToInsert } = await req.json();

    // 1. Kiểm tra Admin Key (lớp an ninh đầu tiên)
    if (adminKey !== Deno.env.get("ADMIN_KEY")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 2. Tạo client với quyền năng tối cao
    const supabaseAdmin = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
    );

    // 3. Thực hiện INSERT, bỏ qua mọi RLS
    const { error: insertError } = await supabaseAdmin
      .from("notifications")
      .insert(notificationsToInsert);

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ message: "Notifications sent successfully!" }),
      { status: 200, headers: { ...corsHeaders } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders },
    });
  }
});
