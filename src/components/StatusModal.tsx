import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

interface StatusModalProps {
  status: Status | null;
  messages: {
    loading: string;
    success: string;
    error: string;
  };
}

const statusConfig = {
  loading: {
    icon: <Loader2 className="animate-spin" />,
    color: "text-blue-500",
  },
  success: { icon: <CheckCircle />, color: "text-green-500" },
  error: { icon: <XCircle />, color: "text-red-500" },
};

const StatusModal = ({ status, messages }: StatusModalProps) => {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            key={status} // Rất quan trọng để re-animate khi status thay đổi
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-xs p-8 text-center"
          >
            <div
              className={`mx-auto w-16 h-16 flex items-center justify-center text-4xl ${statusConfig[status].color}`}
            >
              {statusConfig[status].icon}
            </div>
            <p className="mt-4 font-semibold text-lg text-gray-800 dark:text-white">
              {messages[status]}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;
