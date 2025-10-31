import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Server,
  BarChart3,
  Computer,
  Lightbulb,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import SnowfallEffect from "../components/SnowfallEffect";

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleStartPractice = () => {
    navigate("/select-exam");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <SnowfallEffect />
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative">
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 120,
                delay: 0.2,
              }}
            >
              <img
                src="/DoanhNhanFPTU.png"
                alt="App Logo"
                width={60}
                height={60}
                className="mx-auto mb-4"
              />
            </motion.div>
            <motion.h1
              className="text-4xl font-bold text-gray-800 dark:text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Chữa Đề
            </motion.h1>
            <motion.p
              className="text-gray-500 dark:text-gray-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Nơi giúp bạn chữa đề để thi tự tin hơn ✨
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-3 gap-4 my-8 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.6 }}
          >
            <motion.div variants={itemVariants}>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <BrainCircuit className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Câu hỏi đa dạng
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Ngân hàng đề đa dạng
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Giao diện dễ dùng
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-base font-medium shadow-lg transition-all duration-200 hover:shadow-xl text-white flex items-center justify-center rounded-lg"
                onClick={handleStartPractice}
              >
                <Computer className="mr-2 h-5 w-5" />
                Dô
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center mt-6 text-sm text-gray-400 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Lightbulb size={16} className="text-yellow-400" />
            <p>Giúp việc chữa đề đi thi một cách hiệu quả.</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
