import "../styles/profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

import {
  LogOut,
  Star,
  TrendingUp,
  HelpCircle,
  Trophy,
  Target,
  Zap,
  Clock,
  Link as LinkIcon,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";

/* ---------------------------
   ENV cho Discord (FE)
---------------------------- */
const MEMBER = import.meta.env.VITE_DISCORD_MEMBER_ROLE_ID as
  | string
  | undefined;
const VIP = import.meta.env.VITE_DISCORD_VIP_ROLE_ID as string | undefined;
const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
const REDIRECT = import.meta.env.VITE_DISCORD_REDIRECT_URI as
  | string
  | undefined;

function toDiscordAuthUrl() {
  const p = new URLSearchParams({
    client_id: String(CLIENT_ID ?? ""),
    redirect_uri: String(REDIRECT ?? ""),
    response_type: "code",
    scope: "identify guilds.members.read",
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${p.toString()}`;
}

/* ---------------------------
   Kiểu dữ liệu
---------------------------- */
type DiscordData = {
  discord_id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  roles: string[] | null;
  last_checked?: string;
};

const StatCard = ({ icon, label, value, gradient }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
    />
    <div className="relative flex items-center gap-4">
      <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const HistoryItem = ({ item, index }: { item: any; index: number }) => {
  const scorePercentage = (item.score / item.total_points) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div
        className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${
          scorePercentage >= 80
            ? "from-green-400 to-green-600"
            : scorePercentage >= 60
            ? "from-yellow-400 to-yellow-600"
            : "from-red-400 to-red-600"
        }`}
      />
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Trophy
              className={`${
                scorePercentage >= 80
                  ? "text-green-500"
                  : scorePercentage >= 60
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
              size={20}
            />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              {item.quiz_name}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(item.completed_at).toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} />
              <span>
                {Math.floor(item.time_taken / 60)}:
                {(item.time_taken % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right ml-4">
          <div
            className={`text-3xl font-bold ${
              scorePercentage >= 80
                ? "text-green-500"
                : scorePercentage >= 60
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {item.score}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            / {item.total_points} điểm
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                scorePercentage >= 80
                  ? "from-green-400 to-green-600"
                  : scorePercentage >= 60
                  ? "from-yellow-400 to-yellow-600"
                  : "from-red-400 to-red-600"
              }`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------------------
   Khối Discord Integration
   (UI bám sát phong cách card hiện có)
---------------------------- */
function DiscordIntegrationCard() {
  const [loading, setLoading] = useState(false);
  const [discord, setDiscord] = useState<DiscordData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasMember = !!(discord?.roles || []).includes(String(MEMBER ?? ""));
  const hasVIP = !!(discord?.roles || []).includes(String(VIP ?? ""));

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) throw new Error("NO_SESSION");
      const r = await fetch("/api/discord-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.code || String(r.status));
      setDiscord(j.data as DiscordData);
    } catch (e: any) {
      setError(e?.message || "STATUS_FAILED");
      setDiscord(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshNow = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) throw new Error("NO_SESSION");
      const r = await fetch("/api/discord-refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.code || String(r.status));
      setDiscord(j.data as DiscordData);
    } catch (e: any) {
      setError(e?.message || "REFRESH_FAILED");
    } finally {
      setLoading(false);
    }
  };

  // Tự check khi vào trang & khi tab focus trở lại
  useEffect(() => {
    fetchStatus();
    const onFocus = () => fetchStatus();
    const onVisible = () =>
      document.visibilityState === "visible" && fetchStatus();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-xl">
          <LinkIcon
            className="text-indigo-600 dark:text-indigo-300"
            size={22}
          />
        </div>
        <h3 className="text-xl font-extrabold text-gray-800 dark:text-white">
          Discord
        </h3>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Đang kiểm tra…" : ""}
        </div>
      </div>

      {/* trạng thái liên kết */}
      <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
        {discord?.discord_id ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {discord?.avatar ? (
                <img
                  src={discord.avatar}
                  className="w-9 h-9 rounded-full border border-white/20"
                  alt=""
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 grid place-items-center">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Đã liên kết
                </div>
                <div className="font-semibold text-gray-800 dark:text-white truncate">
                  @{discord.username}
                  {discord.discriminator ? `#${discord.discriminator}` : ""}
                </div>
              </div>
            </div>
            <button
              onClick={refreshNow}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw size={16} /> Đồng bộ Discord
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Chưa liên kết
            </div>
            <a
              href={toDiscordAuthUrl()}
              className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <LinkIcon size={16} />
              Liên kết Discord
            </a>
          </div>
        )}
        {!!error && (
          <div className="mt-2 text-xs text-red-500">Lỗi: {error}</div>
        )}
        {!!discord?.last_checked && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lần kiểm tra:{" "}
            {new Date(discord.last_checked).toLocaleString("vi-VN")}
          </div>
        )}
      </div>

      {/* badge role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasMember ? (
              <ShieldCheck className="text-emerald-500" size={18} />
            ) : (
              <ShieldAlert className="text-gray-400" size={18} />
            )}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Hội viên
              </div>
              <div
                className={`text-sm font-semibold ${
                  hasMember
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {hasMember ? "Đã xác minh ✓" : "Chưa đăng ký"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasVIP ? (
              <ShieldCheck className="text-amber-500" size={18} />
            ) : (
              <ShieldAlert className="text-gray-400" size={18} />
            )}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                VIP
              </div>
              <div
                className={`text-sm font-semibold ${
                  hasVIP
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {hasVIP ? "Đã xác minh ✓" : "Chưa đăng ký"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("quiz_history")
        .select("*")
        .order("completed_at", { ascending: false });
      if (data) setHistory(data);
    };
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Zap className="text-indigo-500" size={48} />
          </motion.div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  const totalQuizzes = history.length;
  const averageScore =
    totalQuizzes > 0
      ? (
          (history.reduce(
            (sum, item) => sum + item.score / item.total_points,
            0
          ) /
            totalQuizzes) *
          100
        ).toFixed(0)
      : 0;

  const totalScore = history.reduce((sum, item) => sum + item.score, 0);
  const bestScore =
    history.length > 0
      ? Math.max(
          ...history.map((item) => (item.score / item.total_points) * 100)
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Profile Section (giữ nguyên layout) */}
          <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
            <div className="relative p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`
                    }
                    alt="Avatar"
                    className="relative h-32 w-32 rounded-full border-4 border-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8"></div>
                </motion.div>

                <div className="flex-1 text-center sm:text-left">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl font-black text-white mb-2"
                  >
                    {profile.display_name || profile.username}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/90 text-lg font-medium"
                  >
                    @{profile.username}
                  </motion.p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition shadow-lg border border-white/30"
                >
                  <LogOut size={20} /> Đăng xuất
                </motion.button>
              </div>
            </div>
          </div>

          {/* Discord Integration — thêm ngay dưới hero */}
          <div className="mb-8">
            <DiscordIntegrationCard />
          </div>

          {/* Stats Grid (giữ giao diện) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<TrendingUp className="text-white" size={24} />}
              label="Số lượt làm bài"
              value={totalQuizzes}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Star className="text-white" size={24} />}
              label="Tỷ lệ đúng TB"
              value={`${averageScore}%`}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={<Trophy className="text-white" size={24} />}
              label="Điểm cao nhất"
              value={`${bestScore.toFixed(0)}%`}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<Target className="text-white" size={24} />}
              label="Tổng điểm"
              value={totalScore}
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          {/* History Section (giữ giao diện) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <Clock className="text-white" size={28} />
                </div>
                Lịch Sử Làm Bài
              </h2>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {history.length} bài quiz
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <HistoryItem key={item.id} item={item} index={index} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle
                      className="text-gray-400 dark:text-gray-500"
                      size={40}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Chưa có lịch sử
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Bạn chưa làm bài nào cả. Hãy bắt đầu ngay!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg"
                  >
                    Khám phá Quiz
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
