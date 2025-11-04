import { CheckCircle, XCircle } from "lucide-react";
import { useAppStore } from "../store/quizStore";
import { QuizOption, QuizQuestion } from "../types";
import MathText from "./MathText";

interface OptionItemProps {
  option: QuizOption;
  question: QuizQuestion;
}

const OptionItem = ({ option, question }: OptionItemProps) => {
  const { answers, showResults, selectAnswer } = useAppStore((state) => ({
    answers: state.answers,
    showResults: state.showResults,
    selectAnswer: state.selectAnswer,
  }));

  const userAnswers = answers[question.id] || [];
  const hasAnswered = showResults[question.id];

  const isSelected = userAnswers.includes(option.label);
  const isCorrectAnswer = question.correct.includes(option.label);

  let bgColor =
    "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600";
  let borderColor = "border-gray-200 dark:border-gray-600";
  let icon = null;

  if (isSelected && !hasAnswered) {
    bgColor = "bg-indigo-50 dark:bg-indigo-900/50";
    borderColor = "border-indigo-400 dark:border-indigo-600";
  }

  if (hasAnswered) {
    if (isCorrectAnswer) {
      bgColor = "bg-green-50 dark:bg-green-900/50";
      borderColor = "border-green-500 dark:border-green-600";
      icon = <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (isSelected) {
      bgColor = "bg-red-50 dark:bg-red-900/50";
      borderColor = "border-red-500 dark:border-red-600";
      icon = <XCircle className="w-6 h-6 text-red-600" />;
    } else {
      bgColor = "bg-gray-50 dark:bg-gray-700";
      borderColor = "border-gray-200 dark:border-gray-600";
    }
  }

  return (
    <button
      onClick={() => !hasAnswered && selectAnswer(question.id, option.label)}
      disabled={hasAnswered}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ease-in-out ${bgColor} ${borderColor} ${
        !hasAnswered
          ? "hover:scale-[1.02] cursor-pointer"
          : "cursor-not-allowed"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
            hasAnswered && isCorrectAnswer
              ? "bg-green-500 text-white"
              : hasAnswered && isSelected
              ? "bg-red-500 text-white"
              : isSelected
              ? "bg-indigo-500 text-white"
              : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
          }`}
        >
          {option.label}
        </div>
        {/* Render đáp án bằng MathText để hỗ trợ LaTeX + <br> */}
        <div className="flex-1 text-gray-800 dark:text-gray-100 font-medium">
          <MathText html={option.text} />
        </div>
        {icon}
      </div>
    </button>
  );
};

export default OptionItem;
