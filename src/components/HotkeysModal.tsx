import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import React from "react";

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const hotkeys = [
  { action: "Chọn đáp án A, B, C...", keys: ["A", "B", "C"] },
  { action: "Câu tiếp theo", keys: ["→", "N", "Space"] },
  { action: "Câu trước đó", keys: ["←", "P"] },
  { action: "Làm lại đề", keys: ["R"] },
  { action: "Mở/Đóng bảng phím tắt", keys: ["?"] },
  { action: "Thoát (về trang chọn đề)", keys: ["Esc"] },
];

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md transition-colors duration-300">
    {children}
  </kbd>
);

const HotkeysModal = ({ isOpen, onClose }: HotkeysModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Keyboard className="text-gray-700 dark:text-gray-300" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Phím tắt
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Sử dụng các phím tắt sau để thao tác nhanh hơn:
            </p>
            <div className="space-y-3">
              {hotkeys.map(({ action, keys }) => (
                <div
                  key={action}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {action}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {keys.map((key) => (
                      <Key key={key}>{key}</Key>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-8 w-full bg-gray-800 dark:bg-gray-900 hover:bg-gray-900 dark:hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors duration-300"
            >
              Đã hiểu
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HotkeysModal;
