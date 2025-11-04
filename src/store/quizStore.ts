import create from "zustand";
import { QuizQuestion, QuizInfo } from "../types";
import { supabase } from "../supabaseClient";
import { useAuthStore } from "./authStore";

type QuizWithQuestions = QuizInfo & { questions: any[] }; // luôn có mảng

interface AppState {
  theme: "light" | "dark";
  quizList: Omit<QuizInfo, "questions" | "password">[];
  selectedQuiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  answers: Record<number, string[]>;
  showResults: Record<number, boolean>;
  results: Record<number, boolean>;
  isQuizActive: boolean;
  lastCorrectAnswerId: number | null;
  isQuizCompleted: boolean;

  isNotesPanelOpen: boolean;
  notes: Record<number, string>;

  // Actions
  toggleTheme: () => void;
  fetchQuizList: () => Promise<void>;
  fetchQuizById: (quizId: number, password?: string) => Promise<boolean>;
  importQuiz: (
    quizName: string,
    description: string,
    isProtected: boolean,
    questions: QuizQuestion[],
    adminKey: string
  ) => Promise<{ success: boolean; message: string }>;
  deleteQuiz: (
    quizId: number,
    adminKey: string
  ) => Promise<{ success: boolean; message: string }>;
  selectAnswer: (questionId: number, optionLabel: string) => void;
  checkAnswer: (questionId: number, timeTaken: number) => void;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  goToQuestion: (questionIndex: number) => void;
  resetCurrentQuiz: () => void;
  resetCurrentQuestion: () => void;
  clearConfettiTriggers: () => void;
  goHome: () => void;
  isSubmitting: boolean;
  submitSuccess: boolean;
  resetSubmitState: () => void;
  submitQuiz: (timeTaken: number) => Promise<boolean>;

  toggleNotesPanel: () => void;
  fetchNotes: (quizId: number) => Promise<void>;
  upsertNote: (
    questionId: number,
    quizId: number,
    content: string
  ) => Promise<void>;
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
  results: {},
  isQuizActive: false,
  lastCorrectAnswerId: null,
  isQuizCompleted: false,
  isSubmitting: false,
  submitSuccess: false,

  isNotesPanelOpen: false,
  notes: {},

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    set({ theme: newTheme });
  },

  fetchQuizList: async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, name, description, is_protected, created_at") // ⬅ THÊM created_at
      .order("created_at", { ascending: false }); // mặc định mới nhất (tuỳ bạn)

    if (error) {
      console.error("Error fetching quiz list:", error);
      set({ quizList: [] });
    } else {
      // data trả về đúng shape Omit<QuizInfo, "questions" | "password">
      set({ quizList: data || [] });
    }
  },

  fetchQuizById: async (quizId, password) => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error || !data) {
      console.error(error);
      if (!password) alert("Không thể tải đề. Vui lòng thử lại.");
      return false;
    }

    if (data.is_protected && data.password !== password) {
      return false;
    }

    await get().fetchNotes(quizId);

    const normalized: QuizWithQuestions = {
      id: data.id,
      name: data.name,
      description: data.description ?? "",
      is_protected: !!data.is_protected,
      created_at: data.created_at ?? undefined,
      questions: Array.isArray(data.questions) ? data.questions : [], // ⬅ quan trọng
    };

    set({
      selectedQuiz: normalized,
      isQuizActive: true,
      currentQuestionIndex: 0,
      answers: {},
      showResults: {},
      results: {},
      isQuizCompleted: false,
      lastCorrectAnswerId: null,
    });
    return true;
  },

  importQuiz: async (
    quizName,
    description,
    isProtected,
    questions,
    adminKey
  ) => {
    // Bỏ password
    if (adminKey !== import.meta.env.VITE_ADMIN_KEY) {
      return { success: false, message: "Sai Admin Key!" };
    }

    const { error } = await supabase
      .from("quizzes")
      .insert([
        { name: quizName, description, is_protected: isProtected, questions },
      ]);

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

  checkAnswer: (questionId) => {
    const { selectedQuiz, answers } = get();
    if (!selectedQuiz) return;
    const question = selectedQuiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    const userAnswers = answers[questionId] || [];
    const isCorrect =
      userAnswers.length === question.correct.length &&
      userAnswers.every((a) => question.correct.includes(a)) &&
      userAnswers.length > 0;

    set((state) => ({
      showResults: { ...state.showResults, [questionId]: true },
      results: { ...state.results, [questionId]: isCorrect },
      lastCorrectAnswerId: isCorrect ? questionId : null,
    }));
  },

  submitQuiz: async (timeTaken) => {
    const { selectedQuiz, results } = get();
    const userId = useAuthStore.getState().session?.user?.id;

    if (!selectedQuiz || !userId) {
      console.error("Không thể nộp bài: thiếu thông tin đề hoặc user.");
      return false;
    }

    // Tính toán điểm số lần cuối
    const totalPoints = selectedQuiz.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );
    let earnedPoints = 0;
    selectedQuiz.questions.forEach((q) => {
      if (results[q.id] === true) {
        earnedPoints += q.points;
      }
    });

    // Tạo bản ghi lịch sử
    const historyData = {
      user_id: userId,
      quiz_id: selectedQuiz.id,
      quiz_name: selectedQuiz.name,
      score: earnedPoints,
      total_points: totalPoints,
      time_taken: typeof timeTaken === "number" ? timeTaken : 0,
    };

    // Lưu vào Supabase
    const { error } = await supabase.from("quiz_history").insert([historyData]);
    if (error) {
      console.error("Error saving quiz history:", error);
      return false; // TRẢ VỀ FALSE
    }
    console.log("Quiz history saved successfully!");

    set({ isQuizCompleted: true });
    return true;
  },

  resetSubmitState: () => set({ isSubmitting: false, submitSuccess: false }),

  clearConfettiTriggers: () =>
    set({ lastCorrectAnswerId: null, isQuizCompleted: false }),

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

  resetCurrentQuestion: () => {
    const { selectedQuiz, currentQuestionIndex } = get();
    if (!selectedQuiz) return;

    const currentQuestionId = selectedQuiz.questions[currentQuestionIndex].id;

    set((state) => {
      // Tạo bản sao của các object state để tránh mutate
      const newAnswers = { ...state.answers };
      const newShowResults = { ...state.showResults };
      const newResults = { ...state.results };

      // Xóa thông tin của câu hỏi hiện tại
      delete newAnswers[currentQuestionId];
      delete newShowResults[currentQuestionId];
      delete newResults[currentQuestionId];

      // Cách trả về đúng: Chỉ cập nhật những state đã thay đổi
      return {
        ...state, // GIỮ LẠI TẤT CẢ CÁC STATE CŨ KHÁC
        answers: newAnswers,
        showResults: newShowResults,
        results: newResults,
      };
    });
  },

  resetCurrentQuiz: () =>
    set(() => ({
      currentQuestionIndex: 0,
      answers: {},
      showResults: {},
      results: {},
      lastCorrectAnswerId: null,
      isQuizCompleted: false,
      isSubmitting: false,
      submitSuccess: false,
    })),

  goHome: () =>
    set({
      isQuizActive: false,
      selectedQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      showResults: {},
      results: {},
      isQuizCompleted: false,
      lastCorrectAnswerId: null,
      isNotesPanelOpen: false,
      notes: {},
    }),

  toggleNotesPanel: () =>
    set((state) => ({ isNotesPanelOpen: !state.isNotesPanelOpen })),

  fetchNotes: async (quizId) => {
    const user = useAuthStore.getState().session?.user;
    if (!user) {
      set({ notes: {} });
      return;
    }

    const { data, error } = await supabase
      .from("user_notes")
      .select("question_id, content")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId);

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      const notesMap = data.reduce((acc, note) => {
        (acc as any)[note.question_id] = note.content;
        return acc;
      }, {});
      set({ notes: notesMap });
    }
  },

  upsertNote: async (questionId, quizId, content) => {
    const user = useAuthStore.getState().session?.user;
    if (!user) return;

    const { error } = await supabase.from("user_notes").upsert(
      {
        user_id: user.id,
        question_id: questionId,
        quiz_id: quizId,
        content: content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, quiz_id, question_id" }
    ); // Sửa lại onConflict cho đúng 3 cột

    if (error) {
      console.error("Error upserting note:", error);
    } else {
      set((state) => ({ notes: { ...state.notes, [questionId]: content } }));
    }
  },
}));
