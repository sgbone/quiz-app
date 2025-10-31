import { useEffect, useState } from "react";
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
} from "lucide-react";

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-4 transition-colors duration-300">
    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const HistoryItem = ({ item }: { item: any }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-colors duration-300">
    <div>
      <p className="font-semibold text-gray-800 dark:text-white">
        {item.quiz_name}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Hoàn thành lúc: {new Date(item.completed_at).toLocaleString()}
      </p>
    </div>
    <div className="text-right">
      <p
        className={`font-bold text-lg ${
          item.score > 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {item.score}/{item.total_points} điểm
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {Math.floor(item.time_taken / 60)
          .toString()
          .padStart(2, "0")}
        :{(item.time_taken % 60).toString().padStart(2, "0")}
      </p>
    </div>
  </div>
);

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, logout, session } = useAuthStore();
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
      <div className="h-full flex items-center justify-center text-white">
        Đang tải hồ sơ...
      </div>
    );
  }

  // Tính toán thống kê
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

  // LẤY VÀ FORMAT NGÀY THAM GIA
  const joinDate = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString("vi-VN")
    : "N/A";

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-6 mb-8 transition-colors duration-300">
          <img
            src={
              profile.avatar_url ||
              `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile.username}`
            }
            alt="Avatar"
            className="h-20 w-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              @{profile.username}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="text-indigo-500" />}
            label="Số lượt làm bài"
            value={totalQuizzes}
          />
          <StatCard
            icon={<Star className="text-yellow-500" />}
            label="Tỷ lệ đúng trung bình"
            value={`${averageScore}%`}
          />
          <StatCard
            icon={<CalendarPlus className="text-blue-500" />}
            label="Ngày tham gia"
            value={joinDate}
          />
        </div>

        {/* History */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Lịch Sử Làm Bài
          </h2>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => <HistoryItem key={item.id} item={item} />)
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
                <HelpCircle className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 dark:text-gray-400">
                  Bạn chưa làm bài nào cả. Hãy bắt đầu ngay!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
