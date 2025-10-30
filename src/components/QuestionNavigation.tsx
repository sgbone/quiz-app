import { useAppStore } from "../store/quizStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const QuestionNavigation = () => {
  const {
    selectedQuiz,
    currentQuestionIndex,
    showResults,
    goToNextQuestion,
    goToPrevQuestion,
    resetCurrentQuestion,
  } = useAppStore((state) => ({
    selectedQuiz: state.selectedQuiz,
    currentQuestionIndex: state.currentQuestionIndex,
    showResults: state.showResults,
    goToNextQuestion: state.goToNextQuestion,
    goToPrevQuestion: state.goToPrevQuestion,
    resetCurrentQuestion: state.resetCurrentQuestion,
  }));

  if (!selectedQuiz) return null;

  const currentQuestionId = selectedQuiz.questions[currentQuestionIndex].id;
  const hasAnswered = showResults[currentQuestionId];

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion =
    currentQuestionIndex === selectedQuiz.questions.length - 1;
  const layoutTransition = { type: "spring", stiffness: 300, damping: 25 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-between items-center gap-4 mt-6"
    >
      {/*Nút câu trước*/}
      <motion.button
        layout // KÍCH HOẠT VŨ ĐIỆU
        transition={layoutTransition} // ÁP DỤNG HIỆU ỨNG LÒ XO
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={goToPrevQuestion}
        disabled={isFirstQuestion}
        className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-colors duration-200 flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
        Câu trước
      </motion.button>

      {/*Nút Làm Lại*/}
      <AnimatePresence>
        {hasAnswered && (
          <motion.button
            layout // KÍCH HOẠT VŨ ĐIỆU
            transition={layoutTransition} // ÁP DỤNG HIỆU ỨNG LÒ XO
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetCurrentQuestion}
            className="bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-2 border-amber-500/50 dark:border-amber-400/50
                       py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-400/10
                       transition-shadow duration-200 flex items-center justify-center gap-2"
            title="Làm lại câu này (R)"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden md:inline">Làm lại</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/*Nút Câu Sau*/}
      <motion.button
        layout // KÍCH HOẠT VŨ ĐIỆU
        transition={layoutTransition} // ÁP DỤNG HIỆU ỨNG LÒ XO
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={goToNextQuestion}
        disabled={isLastQuestion}
        className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-colors duration-200 flex items-center justify-center gap-2
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
      >
        Câu sau
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default QuestionNavigation;
