import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const getReturnTo = () => {
    const qs = new URLSearchParams(location.search);
    const next = qs.get("next");
    const fromState = (location.state as any)?.from as string | undefined;
    return fromState || next || "/project";
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Nếu có history để quay lại trang vừa rồi thì ưu tiên navigate(-1)
        // còn không thì đi theo getReturnTo()
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(getReturnTo(), { replace: true });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const returnTo = getReturnTo();
    if (
      window.history.length > 1 &&
      !location.state?.from &&
      !new URLSearchParams(location.search).get("next")
    ) {
      navigate(-1);
    } else {
      navigate(returnTo, { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0" aria-hidden>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Local keyframes used by the premium design */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(-100vh) translateX(50px); opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .shimmer {
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="relative w-full max-w-md z-10">
        {/* Glass card with premium effects */}
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden group">
          {/* Subtle shimmer on hover */}
          <div className="absolute inset-0 shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Soft gradient glow behind */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

          <div className="relative p-8 sm:p-10">
            {/* Header with icon */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl transform transition-transform duration-300">
                  <LogIn className="text-white" size={32} aria-hidden />
                </div>
              </div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
                Đăng Nhập
              </h1>
              <p
                className="text-purple-200 text-sm flex items-center justify-center gap-2"
                aria-live="polite"
              >
                <Sparkles size={16} className="animate-pulse" aria-hidden />
                Chào mừng trở lại!
                <Sparkles size={16} className="animate-pulse" aria-hidden />
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                    focusedField === "email" ? "opacity-50" : ""
                  }`}
                />
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 transition-colors duration-300 ${
                      focusedField === "email" ? "text-purple-400" : ""
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-purple-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-4 transition-all duration-300 outline-none"
                    aria-label="Email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                    focusedField === "password" ? "opacity-50" : ""
                  }`}
                />
                <div className="relative">
                  <Lock
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 transition-colors duration-300 ${
                      focusedField === "password" ? "text-purple-400" : ""
                    }`}
                    size={20}
                    aria-hidden
                  />
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-purple-300 border-2 border-white/20 focus:border-purple-400 focus:bg-white/15 rounded-xl pl-12 pr-4 py-4 transition-all duration-300 outline-none"
                    aria-label="Mật khẩu"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl px-4 py-3"
                  role="alert"
                >
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 focus:ring-offset-slate-900 disabled:opacity-60"
                aria-busy={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative px-6 py-4 flex items-center justify-center gap-2 font-semibold text-white">
                  {loading ? (
                    <>
                      <div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                        aria-hidden
                      />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} aria-hidden />
                      <span>Đăng Nhập</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-purple-200 text-sm">
                Chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text hover:from-purple-300 hover:to-pink-300 transition-all duration-300 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Decorative corners */}
            <div
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-transparent rounded-bl-full opacity-20"
              aria-hidden
            />
            <div
              className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500 to-transparent rounded-tr-full opacity-20"
              aria-hidden
            />
          </div>
        </div>

        {/* Outer glow */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl blur-3xl opacity-20 animate-pulse"
          aria-hidden
        />
      </div>
    </div>
  );
}
