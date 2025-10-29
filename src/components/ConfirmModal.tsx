import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmModalProps) => {
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-8 relative transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={32} />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                {message}
              </p>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg transition-colors duration-300"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
