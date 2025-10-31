import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { LogIn, User } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession, fetchProfile } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "login-with-username",
        {
          body: { username, password },
        }
      );
      if (invokeError) throw invokeError;
      if (data.error) throw new Error(data.error);
      setSession(data.session);
      await fetchProfile();
      navigate("/select-exam");
    } catch (e: any) {
      setError(e.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tên đăng nhập (username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-12 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-indigo-500 focus:ring-0 rounded-lg pr-4 py-3 transition"
              />
            </div>
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
