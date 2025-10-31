import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          display_name: displayName,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`, // Avatar ngẫu nhiên
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (user) {
      // Supabase tự động thêm vào bảng `profiles` nhờ có Trigger
      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
      // Giữ người dùng trên trang để họ thấy thông báo thành công
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto text-indigo-500 mb-4" size={40} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Tạo Tài Khoản
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Tham gia cộng đồng chữa đề!
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 border-none transition"
            />
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 border-none transition"
            />
            <input
              type="text"
              placeholder="Tên đăng nhập (username) *"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 border-none transition"
            />
            <input
              type="password"
              placeholder="Mật khẩu *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 border-none transition"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Đã có tài khoản?{" "}
            </span>
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
