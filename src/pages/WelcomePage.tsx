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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <SnowfallEffect />

        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-3xl transform scale-105" />

        <div className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 relative border border-white/20 dark:border-white/10">
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>

          <div className="text-center relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 120,
                delay: 0.2,
              }}
              className="relative"
            >
              {/* Glow ring around logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-60"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <img
                src="/DoanhNhanFPTU.png"
                alt="App Logo"
                width={60}
                height={60}
                className="mx-auto mb-4 relative z-10 drop-shadow-2xl"
              />
            </motion.div>

            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 drop-shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Chữa Đề
            </motion.h1>

            <motion.p
              className="text-gray-300 dark:text-gray-300 text-base font-medium"
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
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/50 to-emerald-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/50">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <p className="text-sm font-semibold text-white dark:text-gray-200 mt-2">
                Câu hỏi đa dạng
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-cyan-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/50">
                  <Server className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <p className="text-sm font-semibold text-white dark:text-gray-200 mt-2">
                Ngân hàng đề đa dạng
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-pink-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-500/50">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <p className="text-sm font-semibold text-white dark:text-gray-200 mt-2">
                Giao diện dễ dùng
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="bg-white/5 dark:bg-gray-900/30 p-6 rounded-2xl border border-white/10 dark:border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <button
                className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 h-14 text-lg font-bold shadow-2xl transition-all duration-300 hover:shadow-blue-500/50 text-white flex items-center justify-center rounded-xl overflow-hidden group"
                onClick={handleStartPractice}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />

                {/* Button content */}
                <span className="relative z-10 flex items-center">
                  <Computer className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Dô
                </span>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center mt-6 text-sm flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb size={18} className="text-yellow-400 drop-shadow-lg" />
            </motion.div>
            <p className="text-gray-200 dark:text-gray-300 font-medium">
              Giúp việc chữa đề đi thi một cách hiệu quả.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
