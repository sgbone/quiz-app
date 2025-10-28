import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../store/quizStore";
import { useQuizHotkeys } from "../hooks/useQuizHotkeys";
import QuestionCard from "../components/QuestionCard";
import QuizSidebar from "../components/QuizSidebar";
import HotkeysModal from "../components/HotkeysModal";
import { AnimatePresence } from "framer-motion";
import SnowfallEffect from "../components/SnowfallEffect";

const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);

  const { selectedQuiz, currentQuestionIndex, fetchQuizById } = useAppStore(
    (state) => ({
      selectedQuiz: state.selectedQuiz,
      currentQuestionIndex: state.currentQuestionIndex,
      fetchQuizById: state.fetchQuizById,
    })
  );

  useQuizHotkeys(() => setIsHotkeysModalOpen((prev) => !prev));

  useEffect(() => {
    if (quizId) {
      fetchQuizById(parseInt(quizId, 10));
    }
  }, [quizId, fetchQuizById]);

  if (!selectedQuiz) {
    return (
      <div className="h-full flex items-center justify-center text-white text-xl">
        Đang tải đề...
      </div>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];

  return (
    <div className="p-4 h-full flex justify-center overflow-hidden">
      <SnowfallEffect />

      <div className="max-w-7xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột Câu hỏi (HIỂN THỊ TRƯỚC) */}
        <div className="lg:col-span-2 flex flex-col">
          <AnimatePresence mode="wait">
            <QuestionCard key={currentQuestion.id} question={currentQuestion} />
          </AnimatePresence>
        </div>

        {/* Cột Sidebar (HIỂN THỊ SAU) */}
        <div className="lg:col-span-1">
          <QuizSidebar onShowHotkeys={() => setIsHotkeysModalOpen(true)} />
        </div>
      </div>

      <HotkeysModal
        isOpen={isHotkeysModalOpen}
        onClose={() => setIsHotkeysModalOpen(false)}
      />
    </div>
  );
};

export default QuizPage;
