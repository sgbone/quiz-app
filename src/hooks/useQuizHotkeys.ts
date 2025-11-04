import { useEffect } from "react";
import { useAppStore } from "../store/quizStore";
import { useQuizTimer } from "./useQuizTimer";

/** Kiểu nhẹ cho hotkeys */
type AnswerOptionLite = {
  id: number | string;
  label: string;
};
type QuestionLite = {
  id: number | string;
  options: AnswerOptionLite[];
};

/** Chuẩn hoá id về number (Supabase id thường là int) */
const toNum = (v: string | number): number => {
  return typeof v === "number" ? v : Number.parseInt(v, 10);
};

export const useQuizHotkeys = (onToggleHotkeysModal: () => void) => {
  const {
    selectedQuiz,
    currentQuestionIndex,
    selectAnswer,
    checkAnswer,
    goToNextQuestion,
    goToPrevQuestion,
    resetCurrentQuiz,
    showResults,
    isQuizActive,
  } = useAppStore((state) => ({
    selectedQuiz: state.selectedQuiz,
    currentQuestionIndex: state.currentQuestionIndex,
    selectAnswer: state.selectAnswer,
    checkAnswer: state.checkAnswer,
    goToNextQuestion: state.goToNextQuestion,
    goToPrevQuestion: state.goToPrevQuestion,
    resetCurrentQuiz: state.resetCurrentQuiz,
    showResults: state.showResults,
    isQuizActive: state.isQuizActive,
  }));

  const { timeElapsed } = useQuizTimer(isQuizActive);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi đang gõ trong input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Lấy mảng câu hỏi với kiểu rõ ràng => tránh TS7015
      const questions = (selectedQuiz?.questions ?? []) as QuestionLite[];
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      const qid = toNum(currentQuestion.id); // chuẩn hoá id
      const hasAnswered = !!showResults[qid]; // map bằng number-key

      // Phím A..Z để chọn đáp án (nếu chưa chấm)
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !hasAnswered) {
        e.preventDefault();
        const optionExists = (currentQuestion.options ?? []).some(
          (opt: AnswerOptionLite) => opt.label === key
        );
        if (optionExists) {
          selectAnswer(qid, key); // ⬅ expects number id
        }
      }

      // Điều hướng & hành động
      switch (e.key) {
        case " ":
        case "n":
        case "N":
        case "ArrowRight":
          e.preventDefault();
          goToNextQuestion();
          break;
        case "p":
        case "P":
        case "ArrowLeft":
          e.preventDefault();
          goToPrevQuestion();
          break;
        case "Enter":
          if (!hasAnswered) {
            e.preventDefault();
            checkAnswer(qid, timeElapsed); // ⬅ expects number id
          }
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetCurrentQuiz();
          break;
        case "?":
          e.preventDefault();
          onToggleHotkeysModal();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedQuiz,
    currentQuestionIndex,
    selectAnswer,
    checkAnswer,
    goToNextQuestion,
    goToPrevQuestion,
    resetCurrentQuiz,
    onToggleHotkeysModal,
    showResults,
    timeElapsed,
    isQuizActive,
  ]);
};
