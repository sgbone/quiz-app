import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/quizStore";
import { QuizInfo } from "../types";
import { supabase } from "../supabaseClient";
import { BookCopy, CornerDownRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import SnowfallEffect from "../components/SnowfallEffect";
import PasswordModal from "../components/PasswordModal";
import "./SelectExamPage.css";

type QuizListItem = Omit<QuizInfo, "questions" | "password">;

const SelectExamPage = () => {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [quizToUnlock, setQuizToUnlock] = useState<QuizListItem | null>(null);

  const { quizList, fetchQuizList, fetchQuizById } = useAppStore((state) => ({
    quizList: state.quizList,
    fetchQuizList: state.fetchQuizList,
    fetchQuizById: state.fetchQuizById,
  }));

  useEffect(() => {
    fetchQuizList();
  }, [fetchQuizList]);

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
        {
          body: { password },
        }
      );

      if (error) throw error;

      if (data.valid) {
        const success = await fetchQuizById(quizToUnlock.id);
        if (success) {
          setIsPasswordModalOpen(false);
          navigate(`/quiz/${quizToUnlock.id}`);
          return true;
        }
        return false;
      } else {
        return false;
      }
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
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center p-4 h-full"
      >
        <SnowfallEffect />

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-3xl w-full relative z-10 flex flex-col max-h-[85vh] transition-colors duration-300">
          <div className="text-center mb-8 flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookCopy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Danh sách đề ôn tập
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Chọn một đề để bắt đầu làm bài
            </p>
          </div>

          <div className="space-y-4 overflow-y-auto min-h-0 pr-2">
            {quizList.length > 0 ? (
              quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => handleQuizClick(quiz)}
                  className="quiz-item-wrapper block cursor-pointer"
                >
                  <div className="quiz-item-content p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          {quiz.is_protected && (
                            <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {quiz.name}
                          </h3>
                        </div>
                        {quiz.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                      <CornerDownRight className="w-6 h-6 text-indigo-500 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8 bg-black/20 rounded-lg">
                <p>Chưa có đề nào được import.</p>
                <p className="mt-2">
                  Hãy vào{" "}
                  <Link to="/admin" className="text-indigo-400 hover:underline">
                    trang Admin
                  </Link>{" "}
                  để thêm đề.
                </p>
              </div>
            )}
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
