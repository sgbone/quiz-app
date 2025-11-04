import { createClient } from "@supabase/supabase-js";

// Vercel Serverless API Route (Node req/res)
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Gate bằng ADMIN_KEY
  const auth = req.headers.authorization?.replace("Bearer ", "");
  if (!auth || auth !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Nhận dữ liệu từ body
  const { notifications } = req.body as {
    notifications: Array<{
      user_id: string;
      content: string;
      image_url?: string | null;
      link_url?: string | null;
    }>;
  };

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No notifications to insert" });
  }

  // Supabase admin client (service-role → bypass RLS)
  const admin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await admin.from("notifications").insert(
    notifications.map((n) => ({
      user_id: n.user_id,
      content: n.content,
      image_url: n.image_url ?? null,
      link_url: n.link_url ?? null,
    }))
  );

  if (error)
    return res.status(500).json({ success: false, message: error.message });
  return res
    .status(200)
    .json({ success: true, inserted: notifications.length });
}
