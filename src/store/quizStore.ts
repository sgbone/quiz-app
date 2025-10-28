import create from "zustand";
import { QuizQuestion, QuizInfo } from "../types";

interface AppState {
  theme: "light" | "dark"; // Thêm state theme
  quizList: Omit<QuizInfo, "questions">[];
  selectedQuiz: QuizInfo | null;
  currentQuestionIndex: number;
  answers: Record<number, string[]>;
  showResults: Record<number, boolean>;
  isQuizActive: boolean;
  toggleTheme: () => void; // Thêm action toggle
  fetchQuizList: () => Promise<void>;
  fetchQuizById: (quizId: number) => Promise<void>;
  importQuiz: (
    quizName: string,
    description: string,
    questions: QuizQuestion[],
    adminKey: string
  ) => Promise<{ success: boolean; message: string }>;
  deleteQuiz: (
    quizId: number,
    adminKey: string
  ) => Promise<{ success: boolean; message: string }>;
  selectAnswer: (questionId: number, optionLabel: string) => void;
  checkAnswer: (questionId: number) => void;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  goToQuestion: (questionIndex: number) => void;
  resetCurrentQuiz: () => void;
  goHome: () => void;
}

const API_URL = "https://my-json-server.typicode.com/sgbone/quiz-app-db";

const initialTheme =
  (localStorage.getItem("theme") as "light" | "dark") || "light";

export const useAppStore = create<AppState>((set, get) => ({
  theme: initialTheme,
  quizList: [],
  selectedQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  showResults: {},
  isQuizActive: false,

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme); // Lưu theme vào localStorage
    set({ theme: newTheme });
  },

  fetchQuizList: async () => {
    try {
      const response = await fetch(`${API_URL}/quizzes`);
      const data: QuizInfo[] = await response.json();
      const quizList = data.map(({ id, name, description }) => ({
        id,
        name,
        description,
      }));
      set({ quizList });
    } catch (error) {
      console.error("Failed to fetch quiz list:", error);
    }
  },

  fetchQuizById: async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`);
      const data: QuizInfo = await response.json();
      set({
        selectedQuiz: data,
        isQuizActive: true,
        currentQuestionIndex: 0,
        answers: {},
        showResults: {},
      });
    } catch (error) {
      console.error(`Failed to fetch quiz ${quizId}:`, error);
    }
  },

  importQuiz: async (quizName, description, questions, adminKey) => {
    if (adminKey !== import.meta.env.VITE_ADMIN_KEY) {
      return { success: false, message: "Sai Admin Key!" };
    }
    try {
      const newQuiz = { name: quizName, description, questions };
      const response = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuiz),
      });
      if (!response.ok) throw new Error("Server responded with an error");
      await get().fetchQuizList();
      return { success: true, message: "Import đề thành công!" };
    } catch (error) {
      console.error("Failed to import quiz:", error);
      return { success: false, message: "Có lỗi xảy ra khi import." };
    }
  },

  deleteQuiz: async (quizId, adminKey) => {
    if (adminKey !== import.meta.env.VITE_ADMIN_KEY) {
      return { success: false, message: "Sai Admin Key!" };
    }
    try {
      const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Server responded with an error");

      set((state) => ({
        quizList: state.quizList.filter((quiz) => quiz.id !== quizId),
      }));

      return { success: true, message: "Đã xóa đề thành công!" };
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      return { success: false, message: "Có lỗi xảy ra khi xóa." };
    }
  },

  selectAnswer: (questionId, optionLabel) => {
    const { selectedQuiz, answers } = get();
    const question = selectedQuiz?.questions.find((q) => q.id === questionId);
    if (!question) return;
    const currentAnswers = answers[questionId] || [];
    const newAnswers =
      question.type === "multiple"
        ? currentAnswers.includes(optionLabel)
          ? currentAnswers.filter((a) => a !== optionLabel)
          : [...currentAnswers, optionLabel]
        : [optionLabel];
    set({ answers: { ...answers, [questionId]: newAnswers } });
  },

  checkAnswer: (questionId) =>
    set((state) => ({
      showResults: { ...state.showResults, [questionId]: true },
    })),

  goToNextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.selectedQuiz!.questions.length - 1,
        state.currentQuestionIndex + 1
      ),
    })),

  goToPrevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
    })),

  goToQuestion: (questionIndex) => {
    const { selectedQuiz } = get();
    if (
      selectedQuiz &&
      questionIndex >= 0 &&
      questionIndex < selectedQuiz.questions.length
    ) {
      set({ currentQuestionIndex: questionIndex });
    }
  },

  resetCurrentQuiz: () =>
    set(() => ({
      currentQuestionIndex: 0,
      answers: {},
      showResults: {},
    })),

  goHome: () => set({ isQuizActive: false, selectedQuiz: null }),
}));
