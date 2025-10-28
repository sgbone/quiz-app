import { useEffect } from "react";
import { useAppStore } from "../store/quizStore";

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
  } = useAppStore((state) => ({
    selectedQuiz: state.selectedQuiz,
    currentQuestionIndex: state.currentQuestionIndex,
    selectAnswer: state.selectAnswer,
    checkAnswer: state.checkAnswer,
    goToNextQuestion: state.goToNextQuestion,
    goToPrevQuestion: state.goToPrevQuestion,
    resetCurrentQuiz: state.resetCurrentQuiz,
    showResults: state.showResults,
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Không chạy phím tắt khi đang gõ vào input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentQuestion = selectedQuiz?.questions[currentQuestionIndex];
      if (!currentQuestion) return;

      const hasAnswered = showResults[currentQuestion.id];

      // Chọn đáp án (A, B, C, D...)
      const key = e.key.toUpperCase();
      const isOptionKey = /^[A-Z]$/.test(key);
      if (isOptionKey && !hasAnswered) {
        e.preventDefault();
        const optionExists = currentQuestion.options.some(
          (opt) => opt.label === key
        );
        if (optionExists) {
          selectAnswer(currentQuestion.id, key);
        }
      }

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
            checkAnswer(currentQuestion.id);
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
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
  ]);
};
