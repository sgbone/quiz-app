import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ĐÂY LÀ CHỖ QUAN TRỌNG NHẤT MÀ LẦN TRƯỚC TAO GÕ SAI
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
    const { username, password } = await req.json();
    if (!username || !password) {
      throw new Error("Tên đăng nhập và mật khẩu là bắt buộc.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Bước 1: Tìm profile dựa trên username
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id") // Chỉ cần lấy id
      .eq("username", username)
      .single();

    if (profileError || !profile) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }

    // Bước 2: Dùng profile.id để lấy thông tin user đầy đủ (bao gồm email)
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (userError || !user) {
      throw new Error("Không tìm thấy thông tin người dùng.");
    }

    // Bước 3: Dùng email và password để đăng nhập
    const { data: sessionData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

    if (signInError) {
      // Tinh chỉnh lại thông báo lỗi cho thân thiện
      if (signInError.message.includes("Invalid login credentials")) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
      throw signInError;
    }

    return new Response(JSON.stringify(sessionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
