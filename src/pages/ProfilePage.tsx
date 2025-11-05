import "../styles/profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Activity,
  Crown,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import { supabase } from "../supabaseClient";

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

/* ---------------------------
   UI Helpers (Premium look)
---------------------------- */
type StatCardProps = {
  icon: JSX.Element;
  label: string;
  value: string | number;
  gradient: string; // Tailwind gradient classes after bg-gradient-to-br
  delay?: number;
};

const StatCard = ({
  icon,
  label,
  value,
  gradient,
  delay = 0,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 120 }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4">
        <div
          className={`relative p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

const HistoryItem = ({ item, index }: { item: any; index: number }) => {
  const scorePercentage = (item.score / item.total_points) * 100;
  const colors =
    scorePercentage >= 80
      ? {
          bg: "from-emerald-500 to-teal-600",
          text: "text-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        }
      : scorePercentage >= 60
      ? {
          bg: "from-amber-500 to-orange-600",
          text: "text-amber-500",
          badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        }
      : {
          bg: "from-rose-500 to-red-600",
          text: "text-rose-500",
          badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className="group relative"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />
      <div className="relative bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${colors.bg} rounded-l-2xl`}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${colors.bg}`}>
                <Trophy className="text-white" size={18} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {item.quiz_name}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}
              >
                {scorePercentage >= 80
                  ? "Xuất sắc"
                  : scorePercentage >= 60
                  ? "Khá"
                  : "Cần cải thiện"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span>
                  {new Date(item.completed_at).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-yellow-500" />
                <span className="font-semibold">
                  {Math.floor(item.time_taken / 60)}:
                  {(item.time_taken % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className={`text-4xl font-black ${colors.text}`}>
                {item.score}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                / {item.total_points} điểm
              </div>
            </div>

            <div className="w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercentage}%` }}
                transition={{
                  delay: index * 0.08 + 0.3,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className={`h-full rounded-full bg-gradient-to-r ${colors.bg} shadow-sm`}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------------------
   Khối Discord Integration (giữ logic thực tế, nâng giao diện)
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
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />

      <div className="relative bg-white dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-lg animate-pulse" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <LinkIcon className="text-white" size={22} />
              </div>
            </div>
            <h3 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Discord
            </h3>
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Đang kiểm tra…" : ""}
            </div>
          </div>

          {/* trạng thái liên kết */}
          <div className="bg-gray-50/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-2xl p-4 mb-4">
            {discord?.discord_id ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {discord?.avatar ? (
                    <img
                      src={discord.avatar}
                      className="w-10 h-10 rounded-full border border-white/20"
                      alt=""
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 grid place-items-center">
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
              <div className="mt-2 text-xs text-rose-500">Lỗi: {error}</div>
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
            {/* Member */}
            <div
              className={`relative overflow-hidden rounded-xl border-2 ${
                hasMember
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
              } p-4 shadow-md`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    hasMember
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  } shadow-lg`}
                >
                  {hasMember ? (
                    <ShieldCheck className="text-white" size={22} />
                  ) : (
                    <ShieldAlert className="text-white" size={22} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Hội viên
                    </span>
                    {hasMember && (
                      <Sparkles className="text-emerald-500" size={14} />
                    )}
                  </div>
                  <div
                    className={`font-bold ${
                      hasMember
                        ? "text-emerald-600"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {hasMember ? "Đã xác minh ✓" : "Chưa đăng ký"}
                  </div>
                </div>
              </div>
            </div>

            {/* VIP */}
            <div
              className={`relative overflow-hidden rounded-xl border-2 ${
                hasVIP
                  ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
              } p-4 shadow-md`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-yellow-400/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    hasVIP
                      ? "bg-gradient-to-br from-amber-500 to-yellow-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  } shadow-lg`}
                >
                  <Crown className="text-white" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      VIP
                    </span>
                    {hasVIP && (
                      <Sparkles className="text-amber-500" size={14} />
                    )}
                  </div>
                  <div
                    className={`font-bold ${
                      hasVIP
                        ? "text-amber-600"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {hasVIP ? "Đã xác minh ✓" : "Chưa đăng ký"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------
   Trang Profile
---------------------------- */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logout } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("quiz_history")
        .select("*")
        .order("completed_at", { ascending: false });
      if (!error && data) setHistory(data);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />

          <div className="relative p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                <img
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`
                  }
                  alt="Avatar"
                  className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white shadow-2xl ring-4 ring-white/40"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-teal-500 border-4 border-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  <Activity className="text-white" size={20} />
                </div>
              </motion.div>

              <div className="flex-1 text-center sm:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-4xl sm:text-6xl font-black text-white mb-2 drop-shadow-lg">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-white/90 text-lg sm:text-xl font-semibold mb-4 flex items-center justify-center sm:justify-start gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      @{profile.username}
                    </span>
                  </p>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl flex items-center gap-3 transition-all shadow-xl border-2 border-white/30 hover:border-white/50"
              >
                <LogOut size={22} /> <span>Đăng xuất</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Discord Integration */}
        <div className="mb-8">
          <DiscordIntegrationCard />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="text-white" size={28} />}
            label="Số lượt làm bài"
            value={totalQuizzes}
            gradient="from-blue-500 to-cyan-500"
            delay={0.4}
          />
          <StatCard
            icon={<Star className="text-white" size={28} />}
            label="Tỷ lệ đúng TB"
            value={`${averageScore}%`}
            gradient="from-amber-500 to-orange-500"
            delay={0.5}
          />
          <StatCard
            icon={<Trophy className="text-white" size={28} />}
            label="Điểm cao nhất"
            value={`${bestScore.toFixed(0)}%`}
            gradient="from-purple-500 to-pink-500"
            delay={0.6}
          />
          <StatCard
            icon={<Target className="text-white" size={28} />}
            label="Tổng điểm"
            value={totalScore}
            gradient="from-emerald-500 to-teal-500"
            delay={0.7}
          />
        </div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-lg">
                  <Clock className="text-white" size={32} />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Lịch Sử Làm Bài
              </h2>
            </div>
            <div className="bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 px-6 py-3 rounded-full shadow-lg">
              <span className="text-sm font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                className="text-center py-20 bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl"
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <HelpCircle className="text-gray-400" size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  Chưa có lịch sử
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  Bạn chưa làm bài nào cả. Hãy bắt đầu ngay!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Khám phá Quiz
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
