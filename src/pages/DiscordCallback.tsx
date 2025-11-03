import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function DiscordCallback() {
  const navigate = useNavigate();
  const ran = useRef(false); // chặn StrictMode gọi đôi
  const [msg, setMsg] = useState("Đang hoàn tất liên kết Discord...");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const debug = params.get("debug") === "1";

      if (!code) {
        setMsg("Thiếu mã code từ Discord.");
        if (!debug) navigate("/profile");
        return;
      }

      const { data: s } = await supabase.auth.getSession();
      const accessToken = s?.session?.access_token;
      if (!accessToken) {
        setMsg("Bạn chưa đăng nhập.");
        if (!debug) navigate("/profile");
        return;
      }

      setMsg("Gọi API /api/discord-oauth...");
      const res = await fetch(`/api/discord-oauth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}
      if (res.ok && json?.ok) {
        setMsg("Liên kết thành công! Quay lại hồ sơ...");
        if (!debug) setTimeout(() => navigate("/profile"), 500);
      } else {
        setMsg(
          `Liên kết thất bại: ${json?.code || res.status} — ${
            json?.details || text
          }`
        );
        if (!debug) setTimeout(() => navigate("/profile"), 1200);
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-lg w-full bg-white/80 dark:bg-gray-900/60 border rounded-xl p-6 shadow">
        <p className="font-semibold mb-2">Discord OAuth</p>
        <pre className="text-sm whitespace-pre-wrap opacity-80">{msg}</pre>
        <p className="mt-3 text-xs opacity-60">
          Thêm <code>?debug=1</code> vào URL để giữ trang và xem log chi tiết.
        </p>
      </div>
    </div>
  );
}
