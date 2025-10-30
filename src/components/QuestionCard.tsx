import { QuizQuestion } from "../types";
import { useAppStore } from "../store/quizStore";
import { CheckCircle, XCircle } from "lucide-react";
import OptionItem from "./OptionItem";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: QuizQuestion;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
  const { answers, showResults, checkAnswer } = useAppStore((state) => ({
    answers: state.answers,
    showResults: state.showResults,
    checkAnswer: state.checkAnswer,
  }));

  const userAnswers = answers[question.id] || [];
  const hasAnswered = showResults[question.id];
  const isCorrect =
    hasAnswered &&
    userAnswers.length === question.correct.length &&
    userAnswers.every((a) => question.correct.includes(a)) &&
    userAnswers.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-colors duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-4 py-1 rounded-lg text-sm font-semibold">
          {question.type === "multiple" ? "Nhiều đáp án" : "1 đáp án"}
        </span>
        <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-4 py-1 rounded-lg text-sm font-semibold">
          {question.points} điểm
        </span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        {question.question}
      </h2>

      {question.image_url && (
        <img
          src={question.image_url}
          alt="Question"
          className="w-full max-w-md rounded-xl mb-6 shadow-lg"
        />
      )}

      <div className="space-y-3">
        {question.options.map((option) => (
          <OptionItem key={option.label} option={option} question={question} />
        ))}
      </div>

      {!hasAnswered && userAnswers.length > 0 && (
        <button
          onClick={() => checkAnswer(question.id)}
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
        >
          Kiểm tra đáp án
        </button>
      )}

      {hasAnswered && (
        <div
          className={`mt-6 p-6 rounded-xl border-2 transition-colors duration-300 ${
            isCorrect
              ? "bg-green-50 dark:bg-green-900/50 border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/50 border-red-300 dark:border-red-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {isCorrect ? (
              <>
                <CheckCircle className="w-7 h-7 text-green-600" />
                <span className="text-green-800 dark:text-green-300 font-bold text-lg">
                  Chính xác! 🎉
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-7 h-7 text-red-600" />
                <span className="text-red-800 dark:text-red-300 font-bold text-lg">
                  Chưa đúng
                </span>
              </>
            )}
          </div>
          {question.explanation && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Giải thích:</strong> {question.explanation}
            </p>
          )}
          {!isCorrect && (
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              <strong>Đáp án đúng:</strong> {question.correct.join(", ")}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
