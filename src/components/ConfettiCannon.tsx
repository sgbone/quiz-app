import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useAppStore } from "../store/quizStore";

const ConfettiCannon = () => {
  const { lastCorrectAnswerId, isQuizCompleted, clearConfettiTriggers } =
    useAppStore((state) => ({
      lastCorrectAnswerId: state.lastCorrectAnswerId,
      isQuizCompleted: state.isQuizCompleted,
      clearConfettiTriggers: state.clearConfettiTriggers,
    }));

  // Hàm bắn pháo hoa cho câu trả lời đúng
  const fireCorrectAnswerConfetti = useCallback(() => {
    // Bắn một chùm nhỏ, tập trung
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      scalar: 0.8,
    });
  }, []);

  // Hàm bắn pháo hoa khi hoàn thành
  const fireCompletionConfetti = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (isQuizCompleted) {
      fireCompletionConfetti();
      clearConfettiTriggers(); // Reset công tắc sau khi bắn
    } else if (lastCorrectAnswerId !== null) {
      fireCorrectAnswerConfetti();
      clearConfettiTriggers(); // Reset công tắc sau khi bắn
    }
  }, [
    lastCorrectAnswerId,
    isQuizCompleted,
    fireCorrectAnswerConfetti,
    fireCompletionConfetti,
    clearConfettiTriggers,
  ]);

  return null; // Component này không render ra gì cả, nó chỉ chạy hiệu ứng
};

export default ConfettiCannon;
