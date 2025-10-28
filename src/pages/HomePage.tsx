import { useEffect } from "react";
import { useAppStore } from "../store/quizStore";
import { Link } from "react-router-dom";
import { BookCopy, CornerDownRight } from "lucide-react";
import { motion } from "framer-motion";
import SnowfallEffect from "../components/SnowfallEffect";
import "./HomePage.css"; // IMPORT FILE CSS MỚI

const HomePage = () => {
  const { quizList, fetchQuizList } = useAppStore((state) => ({
    quizList: state.quizList,
    fetchQuizList: state.fetchQuizList,
  }));

  useEffect(() => {
    fetchQuizList();
  }, [fetchQuizList]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center p-4 h-full"
    >
      <SnowfallEffect />

      {/* SỬA LẠI LAYOUT CARD CHÍNH CHO CÂN ĐỐI HƠN */}
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-3xl w-full relative z-10 flex flex-col max-h-[85vh]">
        <div className="text-center mb-8 flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookCopy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Danh sách đề ôn tập
          </h1>
          <p className="text-gray-500">Chọn một đề để bắt đầu làm bài</p>
        </div>

        <div className="space-y-4 overflow-y-auto min-h-0 pr-2">
          {quizList.length > 0 ? (
            quizList.map((quiz) => (
              // ÁP DỤNG CẤU TRÚC HTML MỚI CHO HIỆU ỨNG VIỀN LED
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="quiz-item-wrapper block"
              >
                <div className="quiz-item-content p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {quiz.name}
                      </h2>
                      {quiz.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {quiz.description}
                        </p>
                      )}
                    </div>
                    <CornerDownRight className="w-6 h-6 text-indigo-500 flex-shrink-0 ml-4" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Chưa có đề nào được import. Hãy vào trang Admin để thêm đề.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
