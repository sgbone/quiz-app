import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/quizStore";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { Book, Clock, Trophy, Home, Keyboard, RefreshCw } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ConfirmModal from "./ConfirmModal";

interface QuizSidebarProps {
  onShowHotkeys: () => void;
}

const QuizSidebar = ({ onShowHotkeys }: QuizSidebarProps) => {
  const navigate = useNavigate();
  const {
    selectedQuiz,
    currentQuestionIndex,
    results,
    answers,
    showResults,
    isQuizActive,
    resetCurrentQuiz,
    goHome,
    goToQuestion,
  } = useAppStore((state) => ({
    selectedQuiz: state.selectedQuiz,
    currentQuestionIndex: state.currentQuestionIndex,
    results: state.results,
    answers: state.answers,
    showResults: state.showResults,
    isQuizActive: state.isQuizActive,
    resetCurrentQuiz: state.resetCurrentQuiz,
    goHome: state.goHome,
    goToQuestion: state.goToQuestion,
  }));
  const { formattedTime } = useQuizTimer(isQuizActive);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleGoHomeClick = () => {
    setConfirmState({
      isOpen: true,
      title: "Xác nhận thoát",
      message: "Bạn có chắc muốn thoát? Mọi tiến trình sẽ bị mất.",
      onConfirm: () => {
        goHome();
        navigate("/select-exam");
      },
    });
  };

  const handleResetClick = () => {
    setConfirmState({
      isOpen: true,
      title: "Xác nhận làm lại",
      message: "Bạn có chắc muốn làm lại đề này không?",
      onConfirm: () => {
        resetCurrentQuiz();
        setConfirmState({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: () => {},
        });
      },
    });
  };

  const score = useMemo(() => {
    if (!selectedQuiz) return { earnedPoints: 0, totalPoints: 0 };
    let totalPoints = 0;
    let earnedPoints = 0;
    selectedQuiz.questions.forEach((q) => {
      totalPoints += q.points;
      if (showResults[q.id]) {
        const userAnswers = answers[q.id] || [];
        const isCorrect =
          userAnswers.length === q.correct.length &&
          userAnswers.every((a) => q.correct.includes(a)) &&
          userAnswers.length > 0;
        if (isCorrect) earnedPoints += q.points;
      }
    });
    return { earnedPoints, totalPoints };
  }, [selectedQuiz, answers, showResults]);

  if (!selectedQuiz) return null;

  return (
    <>
      <aside className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl p-6 flex flex-col transition-colors duration-300">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <Book className="text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {selectedQuiz.name}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {selectedQuiz.description ? (
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            {selectedQuiz.description}
          </p>
        ) : (
          <div className="mb-6"></div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Clock size={16} /> Thời gian
            </div>
            <p className="font-bold text-xl text-gray-800 dark:text-white">
              {formattedTime}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 transition-colors duration-300">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Trophy size={16} /> Điểm số
            </div>
            <p className="font-bold text-xl text-gray-800 dark:text-white">
              {score.earnedPoints}/{score.totalPoints}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Tiến độ</span>
            <span>
              {Object.keys(results).length}/{selectedQuiz.questions.length}
            </span>
          </div>
          <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {selectedQuiz.questions.map((question, index) => {
              const hasResult = results[question.id] !== undefined;
              const isCorrect = results[question.id];
              let segmentColor = "bg-transparent";

              if (hasResult) {
                segmentColor = isCorrect ? "bg-green-500" : "bg-red-500";
              } else if (index === currentQuestionIndex) {
                segmentColor = "bg-indigo-600 animate-pulse";
              }

              return (
                <div
                  key={question.id}
                  className={`h-full ${segmentColor} transition-colors duration-500`}
                  style={{ flex: 1 }}
                ></div>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto pr-2 max-h-64">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Bản đồ câu hỏi
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {selectedQuiz.questions.map((question, index) => {
              const isCurrent = currentQuestionIndex === index;
              const hasResult = results[question.id] !== undefined;
              const isCorrect = results[question.id];

              let buttonClass =
                "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

              if (hasResult) {
                buttonClass = isCorrect
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white";
              }

              if (isCurrent) {
                buttonClass =
                  "bg-indigo-600 text-white shadow-lg ring-2 ring-white/50";
              }

              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square rounded-lg font-semibold transition-colors duration-300 ${buttonClass}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleGoHomeClick}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <Home size={18} /> Thoát
            </button>
            <button
              onClick={onShowHotkeys}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
            >
              <Keyboard size={18} /> Phím tắt
            </button>
          </div>
          <button
            onClick={handleResetClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
          >
            <RefreshCw size={18} /> Làm lại đề
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
    </>
  );
};

export default QuizSidebar;
