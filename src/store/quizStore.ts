import create from "zustand";
import { QuizQuestion, QuizInfo } from "../types";
import { supabase } from "../supabaseClient"; // IMPORT SUPABASE

interface AppState {
  theme: "light" | "dark";
  quizList: Omit<QuizInfo, "questions">[];
  selectedQuiz: QuizInfo | null;
  currentQuestionIndex: number;
  answers: Record<number, string[]>;
  showResults: Record<number, boolean>;
  isQuizActive: boolean;

  // Actions
  toggleTheme: () => void;
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

// Lấy theme từ localStorage nếu có, nếu không mặc định là 'light'
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
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },

  fetchQuizList: async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, name, description")
      .order("created_at", { ascending: false }); // Sắp xếp đề mới nhất lên đầu

    if (error) {
      console.error("Error fetching quiz list:", error);
      set({ quizList: [] });
    } else {
      set({ quizList: data || [] });
    }
  },

  fetchQuizById: async (quizId) => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
    } else if (data) {
      set({
        selectedQuiz: data as QuizInfo,
        isQuizActive: true,
        currentQuestionIndex: 0,
        answers: {},
        showResults: {},
      });
    }
  },

  importQuiz: async (quizName, description, questions, adminKey) => {
    if (adminKey !== import.meta.env.VITE_ADMIN_KEY) {
      return { success: false, message: "Sai Admin Key!" };
    }
    const { error } = await supabase
      .from("quizzes")
      .insert([{ name: quizName, description, questions }]);

    if (error) {
      console.error("Error importing quiz:", error);
      return { success: false, message: "Có lỗi xảy ra khi import." };
    }

    await get().fetchQuizList();
    return { success: true, message: "Import đề thành công!" };
  },

  deleteQuiz: async (quizId, adminKey) => {
    if (adminKey !== import.meta.env.VITE_ADMIN_KEY) {
      return { success: false, message: "Sai Admin Key!" };
    }
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .match({ id: quizId });

    if (error) {
      console.error("Error deleting quiz:", error);
      return { success: false, message: "Có lỗi xảy ra khi xóa." };
    }

    set((state) => ({
      quizList: state.quizList.filter((quiz) => quiz.id !== quizId),
    }));
    return { success: true, message: "Đã xóa đề thành công!" };
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
    set((state) => {
      if (!state.selectedQuiz) return {};
      return {
        currentQuestionIndex: Math.min(
          state.selectedQuiz.questions.length - 1,
          state.currentQuestionIndex + 1
        ),
      };
    }),

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
