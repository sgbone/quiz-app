import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedField, setFocusedField] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ---- Password strength helpers (from premium UI) ----
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);
    calculatePasswordStrength(pwd);
  };

  // ---- Supabase signup (kept from your original logic) ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: displayName,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (user) {
      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
    }
    setLoading(false);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "from-red-500 to-red-600";
    if (passwordStrength < 70) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-emerald-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-10"
        aria-hidden
      />

      {/* Floating particles */}
      <div className="absolute inset-0" aria-hidden>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
              animation: `float ${8 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Local keyframes used by the premium design */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-120vh) translateX(60px) rotate(180deg); opacity: 0.5; }
          100% { transform: translateY(-120vh) translateX(120px) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .shimmer { background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%); background-size: 1000px 100%; animation: shimmer 3s infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .bg-grid-pattern { background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 50px 50px; }
      `}</style>

      <div className="relative w-full max-w-lg z-10">
        {/* Glass card with premium effects */}
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 shimmer pointer-events-none"
            aria-hidden
          />

          <div className="relative p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl transform transition-all duration-300">
                  <UserPlus className="text-white" size={32} aria-hidden />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                Tạo Tài Khoản
              </h1>
              <p className="text-purple-200 text-sm flex items-center justify-center gap-2">
                <Sparkles size={16} className="animate-pulse" aria-hidden />
                Tham gia cộng đồng chữa đề!
                <Sparkles size={16} className="animate-pulse" aria-hidden />
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              {/* Email */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
                    focusedField === "email" ? "opacity-60" : ""
                  }`}
                />
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "email"
                        ? "text-indigo-400 scale-110"
                        : "text-purple-300"
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-indigo-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-3.5 transition-all duration-300 outline-none"
                    aria-label="Email"
                  />
                  {email && email.includes("@") && (
                    <CheckCircle2
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate-slide-up"
                      size={20}
                      aria-hidden
                    />
                  )}
                </div>
              </div>

              {/* Display name */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
                    focusedField === "displayName" ? "opacity-60" : ""
                  }`}
                />
                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "displayName"
                        ? "text-purple-400 scale-110"
                        : "text-purple-300"
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="text"
                    placeholder="Tên hiển thị"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onFocus={() => setFocusedField("displayName")}
                    onBlur={() => setFocusedField("")}
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-purple-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-3.5 transition-all duration-300 outline-none"
                    aria-label="Tên hiển thị"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
                    focusedField === "username" ? "opacity-60" : ""
                  }`}
                />
                <div className="relative">
                  <User
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "username"
                        ? "text-pink-400 scale-110"
                        : "text-purple-300"
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="text"
                    placeholder="Tên đăng nhập (username) *"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-pink-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-3.5 transition-all duration-300 outline-none"
                    aria-label="Tên đăng nhập"
                  />
                  {username && username.length >= 3 && (
                    <CheckCircle2
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 animate-slide-up"
                      size={20}
                      aria-hidden
                    />
                  )}
                </div>
              </div>

              {/* Password + strength meter */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
                    focusedField === "password" ? "opacity-60" : ""
                  }`}
                />
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "password"
                        ? "text-rose-400 scale-110"
                        : "text-purple-300"
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu *"
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-rose-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-3.5 transition-all duration-300 outline-none"
                    aria-label="Mật khẩu"
                  />
                </div>
                {password && (
                  <div
                    className="mt-2 space-y-1 animate-slide-up"
                    aria-live="polite"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-purple-300">Độ mạnh mật khẩu</span>
                      <span
                        className={`font-semibold ${
                          passwordStrength < 40
                            ? "text-red-400"
                            : passwordStrength < 70
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {getStrengthText()}
                      </span>
                    </div>
                    <div
                      className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm"
                      aria-hidden
                    >
                      <div
                        className={`h-full bg-gradient-to-r ${getStrengthColor()} transition-all duration-500 ease-out rounded-full`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-up"
                  role="alert"
                >
                  <AlertCircle
                    className="text-red-300 flex-shrink-0"
                    size={20}
                    aria-hidden
                  />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  className="bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-up"
                  role="status"
                >
                  <CheckCircle2
                    className="text-green-300 flex-shrink-0"
                    size={20}
                    aria-hidden
                  />
                  <p className="text-green-200 text-sm">{success}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-xl mt-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:ring-offset-indigo-950 disabled:opacity-60"
                aria-busy={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative px-6 py-4 flex items-center justify-center gap-2 font-semibold text-white">
                  {loading ? (
                    <>
                      <div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                        aria-hidden
                      />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} aria-hidden />
                      <span>Tạo Tài Khoản</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-purple-200 text-sm">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text hover:from-indigo-300 hover:to-pink-300 transition-all duration-300 hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>

            {/* Decorative corners */}
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500 to-transparent rounded-bl-full opacity-20"
              aria-hidden
            />
            <div
              className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-500 to-transparent rounded-tr-full opacity-20"
              aria-hidden
            />
          </div>
        </div>

        {/* Card glow */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-25 animate-pulse"
          aria-hidden
        />
      </div>
    </div>
  );
}
