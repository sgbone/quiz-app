import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/quizStore";
import { useQuizHotkeys } from "../hooks/useQuizHotkeys";
import QuestionCard from "../components/QuestionCard";
import QuizSidebar from "../components/QuizSidebar";
import HotkeysModal from "../components/HotkeysModal";
import { AnimatePresence } from "framer-motion";
import SnowfallEffect from "../components/SnowfallEffect";

const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
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
    if (!quizId) {
      navigate("/");
      return;
    }

    if (!selectedQuiz || selectedQuiz.id.toString() !== quizId) {
      fetchQuizById(parseInt(quizId, 10)).then((success) => {
        if (!success) {
          navigate("/");
        }
      });
    }
  }, [quizId, selectedQuiz, fetchQuizById, navigate]);

  if (!selectedQuiz || selectedQuiz.id.toString() !== quizId) {
    return (
      <div className="h-full flex items-center justify-center text-white text-xl">
        Đang xác thực...
      </div>
    );
  }

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];

  return (
    <div className="p-4 h-full flex justify-center overflow-hidden">
      <SnowfallEffect />

      <div className="max-w-7xl w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <AnimatePresence mode="wait">
            <QuestionCard key={currentQuestion.id} question={currentQuestion} />
          </AnimatePresence>
        </div>

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
