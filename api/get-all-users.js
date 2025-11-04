import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Chỉ cho GET hoặc POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Kiểm tra quyền admin (đây chính là key cổng bạn dùng lúc nhập trên web)
  const authHeader = req.headers.authorization?.replace("Bearer ", "");
  if (!authHeader || authHeader !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Tạo Supabase Admin Client (service role key — CHỈ chạy ở server)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // Lấy danh sách user từ Supabase
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return res.status(500).json({ success: false, error });
  }

  return res.status(200).json({ success: true, users: data.users });
}
