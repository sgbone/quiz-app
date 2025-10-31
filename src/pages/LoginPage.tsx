import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/select-exam"); // Chuyển đến trang chọn đề sau khi login thành công
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <LogIn className="mx-auto text-indigo-500 mb-4" size={40} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Đăng Nhập
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Chào mừng trở lại!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Chưa có tài khoản?{" "}
            </span>
            <Link
              to="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
