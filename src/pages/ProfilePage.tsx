import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import {
  LogOut,
  CalendarPlus,
  Star,
  TrendingUp,
  HelpCircle,
  Trophy,
  Target,
  Zap,
  Clock,
} from "lucide-react";

interface QuizHistory {
  id: string;
  quiz_name: string;
  completed_at: string;
  score: number;
  total_points: number;
  time_taken: number;
}

const mmss = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

interface StatCardProps {
  icon: JSX.Element;
  label: string;
  value: string | number;
  gradient: string;
}

const StatCard = ({ icon, label, value, gradient }: StatCardProps) => (
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
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mt-1">
          {value}
        </p>
      </div>
    </div>
  </motion.div>
);

const HistoryItem = ({ item, index }: { item: QuizHistory; index: number }) => {
  const scorePct =
    item.total_points > 0 ? (item.score / item.total_points) * 100 : 0;
  const pct = Math.min(100, Math.max(0, Math.round(scorePct)));
  const band = scorePct >= 80 ? "green" : scorePct >= 60 ? "yellow" : "red";
  const widthClass = `w-[${pct}%]`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div
        className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-${band}-400 to-${band}-600`}
      />

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Trophy
              className={
                band === "green"
                  ? "text-green-500"
                  : band === "yellow"
                  ? "text-yellow-500"
                  : "text-red-500"
              }
              size={20}
            />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
              {item.quiz_name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(item.completed_at).toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={14} />
              <span>{mmss(item.time_taken)}</span>
            </div>
          </div>
        </div>

        <div className="text-right ml-4">
          <div
            className={`text-2xl sm:text-3xl font-bold ${
              band === "green"
                ? "text-green-500"
                : band === "yellow"
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
                band === "green"
                  ? "from-green-400 to-green-600"
                  : band === "yellow"
                  ? "from-yellow-400 to-yellow-600"
                  : "from-red-400 to-red-600"
              } ${widthClass}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logout, session } = useAuthStore();
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("quiz_history")
          .select("*")
          .order("completed_at", { ascending: false });
        if (error) throw error;
        if (mounted && data) setHistory(data as QuizHistory[]);
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải lịch sử.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, []);

  const totalQuizzes = history.length;
  const { averageScorePct, totalScore, bestScorePct } = useMemo(() => {
    if (history.length === 0)
      return { averageScorePct: 0, totalScore: 0, bestScorePct: 0 };
    const totalScore = history.reduce(
      (sum, item) => sum + (item.score || 0),
      0
    );
    const avg =
      (history.reduce(
        (sum, item) =>
          sum + (item.total_points ? item.score / item.total_points : 0),
        0
      ) /
        history.length) *
      100;
    const best = Math.max(
      ...history.map((item) =>
        item.total_points ? (item.score / item.total_points) * 100 : 0
      )
    );
    return {
      averageScorePct: Math.round(avg),
      totalScore,
      bestScorePct: Math.round(best),
    };
  }, [history]);

  const joinDate = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "N/A";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-8 overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
            <div className="relative p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl" />
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`
                    }
                    alt="Avatar"
                    className="relative h-32 w-32 rounded-full border-4 border-white shadow-2xl object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8" />
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
                  <div className="mt-2 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">
                    <CalendarPlus size={16} />
                    <span>Tham gia: {joinDate}</span>
                  </div>
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
              value={`${averageScorePct}%`}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={<Trophy className="text-white" size={24} />}
              label="Điểm cao nhất"
              value={`${bestScorePct}%`}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<Target className="text-white" size={24} />}
              label="Tổng điểm"
              value={totalScore}
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                  <Clock className="text-white" size={24} />
                </div>
                Lịch Sử Làm Bài
              </h2>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  {history.length} bài quiz
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200 border border-red-200 dark:border-red-800">
                Đã xảy ra lỗi khi tải lịch sử: {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Zap className="text-indigo-500" size={40} />
                </motion.div>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Đang tải lịch sử làm bài...
                </p>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <HistoryItem key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
