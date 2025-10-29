import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, X, ArrowRight, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>; // SỬA LẠI KIỂU DỮ LIỆU
  quizName: string;
}

const PasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  quizName,
}: PasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    const success = await onSubmit(password);
    setIsLoading(false);

    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 820);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-8 relative transition-colors duration-300 ${
              error ? "animate-shake" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <div className="text-center">
              <Key
                className="mx-auto text-indigo-500 dark:text-indigo-400 mb-4"
                size={32}
              />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Yêu cầu mật khẩu
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Đề thi{" "}
                <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                  {quizName}
                </span>{" "}
                được bảo vệ.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // Thay đổi type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  autoFocus
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 pr-10 transition" // Thêm pr-10
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  "Đang kiểm tra..."
                ) : (
                  <>
                    <span>Vào làm bài</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;
