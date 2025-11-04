import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/quizStore";
import { QuizInfo } from "../types";
import { supabase } from "../supabaseClient";
import {
  BookCopy,
  CornerDownRight,
  Lock,
  Search,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SnowfallEffect from "../components/SnowfallEffect";
import PasswordModal from "../components/PasswordModal";
import "./SelectExamPage.css";

type QuizListItem = Omit<QuizInfo, "questions" | "password">;
type SortOption = "default" | "newest" | "oldest";

const SelectExamPage = () => {
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [quizToUnlock, setQuizToUnlock] = useState<QuizListItem | null>(null);

  // Nâng cấp: tìm kiếm + sắp xếp + panel filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);

  const { quizList, fetchQuizList, fetchQuizById } = useAppStore((state) => ({
    quizList: state.quizList,
    fetchQuizList: state.fetchQuizList,
    fetchQuizById: state.fetchQuizById,
  }));

  useEffect(() => {
    fetchQuizList();
  }, [fetchQuizList]);

  const filteredAndSortedQuizzes = useMemo(() => {
    // Lọc theo tên + mô tả
    const filtered = quizList.filter(
      (q) =>
        (q.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper lấy timestamp an toàn
    const getTime = (q: QuizInfo): number | null => {
      const v = (q as any).created_at; // có thể là string/number/undefined
      if (v == null) return null;
      if (typeof v === "number") return v;
      const t = Date.parse(String(v));
      return isNaN(t) ? null : t;
    };

    if (sortBy === "default") return filtered;

    // copy ra để sort
    const arr = [...filtered];

    if (sortBy === "newest") {
      arr.sort((a, b) => {
        const ta = getTime(a);
        const tb = getTime(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return 1; // thiếu ngày -> xuống cuối
        if (tb === null) return -1;
        return tb - ta; // mới nhất trước
      });
    } else if (sortBy === "oldest") {
      arr.sort((a, b) => {
        const ta = getTime(a);
        const tb = getTime(b);
        if (ta === null && tb === null) return 0;
        if (ta === null) return -1; // thiếu ngày -> lên đầu (cũ nhất)
        if (tb === null) return 1;
        return ta - tb; // cũ nhất trước
      });
    }

    return arr;
  }, [quizList, searchQuery, sortBy]);

  const handleQuizClick = (quiz: QuizListItem) => {
    if (quiz.is_protected) {
      setQuizToUnlock(quiz);
      setIsPasswordModalOpen(true);
    } else {
      navigate(`/quiz/${quiz.id}`);
    }
  };

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    if (!quizToUnlock) return false;

    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-password",
        { body: { password } }
      );
      if (error) throw error;

      if (data.valid) {
        const ok = await fetchQuizById(quizToUnlock.id);
        if (ok) {
          setIsPasswordModalOpen(false);
          navigate(`/quiz/${quizToUnlock.id}`);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Error verifying password:", e);
      return false;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-center p-4 h-full"
      >
        <SnowfallEffect />

        {/* Khung chính */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-5xl w-full relative z-10 flex flex-col max-h-[90vh] transition-colors duration-300 border border-gray-200/20 dark:border-gray-700/30">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center mb-6 flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <BookCopy className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Danh sách Đề ôn tập
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chọn một đề để bắt đầu làm bài
            </p>
          </motion.div>

          {/* Tìm kiếm & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 flex-shrink-0"
          >
            <div className="flex gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Nút mở filter */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  showFilters
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Panel filter */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sắp xếp theo
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: "default", label: "Mặc định" },
                        { value: "newest", label: "Mới nhất" },
                        { value: "oldest", label: "Cũ nhất" },
                      ].map((opt) => (
                        <motion.button
                          key={opt.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSortBy(opt.value as SortOption)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            sortBy === opt.value
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Số kết quả */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0"
            >
              Tìm thấy{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredAndSortedQuizzes.length}
              </span>{" "}
              kết quả
            </motion.div>
          )}

          {/* Danh sách đề */}
          <div className="space-y-4 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedQuizzes.length > 0 ? (
                filteredAndSortedQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    layout
                  >
                    <div
                      onClick={() => handleQuizClick(quiz)}
                      className="quiz-item-wrapper block cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="quiz-item-content p-6"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {quiz.is_protected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                </motion.div>
                              )}
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                                {quiz.name}
                              </h3>
                            </div>

                            {quiz.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {quiz.description}
                              </p>
                            )}

                            {quiz.created_at && (
                              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {new Date(quiz.created_at).toLocaleDateString(
                                    "vi-VN",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CornerDownRight className="w-6 h-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              ) : searchQuery ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400 py-16 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-lg font-medium mb-2">
                    Không tìm thấy kết quả
                  </p>
                  <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400 py-16 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <BookCopy className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-lg font-medium mb-2">
                    Chưa có đề nào được import.
                  </p>
                  <p className="text-sm">
                    Hãy vào{" "}
                    <Link
                      to="/admin"
                      className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline underline-offset-2"
                    >
                      trang Admin
                    </Link>{" "}
                    để thêm đề.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        quizName={quizToUnlock?.name || ""}
      />
    </>
  );
};

export default SelectExamPage;
