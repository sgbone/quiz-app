import { useState, useEffect } from "react";
import { useAppStore } from "../store/quizStore";
import { QuizQuestion } from "../types";
import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { useAuthStore } from "../store/authStore";

interface NotesPanelProps {
  currentQuestion: QuizQuestion;
}

const NotesPanel = ({ currentQuestion }: NotesPanelProps) => {
  const { notes, upsertNote, selectedQuiz } = useAppStore();
  const { session } = useAuthStore();
  const [text, setText] = useState(() => notes[currentQuestion.id] || "");
  useEffect(() => {
    setText(notes[currentQuestion.id] || "");
  }, [currentQuestion.id]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const debouncedText = useDebounce(text, 1000); // Tự động lưu sau 1 giây ngừng gõ

  useEffect(() => {
    setText(notes[currentQuestion.id] || "");
    setSaveStatus("idle"); // Reset trạng thái khi chuyển câu
  }, [currentQuestion.id, notes]);

  useEffect(() => {
    if (
      session &&
      selectedQuiz &&
      (debouncedText || debouncedText === "") &&
      debouncedText !== (notes[currentQuestion.id] || "")
    ) {
      setSaveStatus("saving");
      upsertNote(currentQuestion.id, selectedQuiz.id, debouncedText).then(
        () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      );
    }
  }, [
    debouncedText,
    currentQuestion.id,
    selectedQuiz,
    session,
    upsertNote,
    notes,
  ]);

  const getStatusText = () => {
    if (saveStatus === "saving") return "Đang lưu...";
    if (saveStatus === "saved") return "Đã lưu ✓";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mt-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-700 dark:text-white">
            Ghi chú cá nhân:
          </h3>
        </div>
        <span className="text-xs text-gray-400 italic transition-opacity duration-300">
          {getStatusText()}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaveStatus("idle");
        }}
        placeholder={
          session
            ? "Ghi chú của bạn sẽ tự động được lưu..."
            : "Đăng nhập để lưu ghi chú của bạn."
        }
        disabled={!session}
        className="w-full h-24 bg-gray-100 dark:bg-gray-900/50 rounded-lg p-3 text-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-indigo-500 focus:ring-0 transition resize-none disabled:opacity-60"
      />
    </motion.div>
  );
};

export default NotesPanel;
