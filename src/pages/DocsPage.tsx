// src/pages/DocsPage.tsx
import { useState, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calculator,
  Code2,
  Cpu,
  GraduationCap,
  FileText,
  Lightbulb,
  TrendingUp,
  Zap,
  BookMarked,
  Brain,
  Binary,
  ArrowRight,
  Home,
  Sparkles,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import SnowfallEffect from "../components/SnowfallEffect"; // Nếu bạn đặt chỗ khác, đổi path import cho đúng

/** ---------- Types ---------- */
type Feature = {
  icon: LucideIcon;
  text: string;
  subtext: string;
};

type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  path: string;
  gradient: string; // tailwind: from-*-* via-*-* to-*-*
  hoverGradient: string; // tailwind: hover:from-* hover:via:* hover:to:*
  glowColor: string; // chỉ mô tả
  icon: LucideIcon;
  features: Feature[];
};

export default function DocsPage() {
  const navigate = useNavigate();
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  // 🔎 Search
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const courses: Course[] = [
    {
      id: "mae101",
      code: "MAE101",
      title: "Mathematics for Engineering",
      description: "Nền tảng toán học cho kỹ sư",
      path: "/",
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
      hoverGradient: "hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700",
      glowColor: "blue",
      icon: Calculator,
      features: [
        { icon: Brain, text: "Mathematics", subtext: "Toán học" },
        { icon: TrendingUp, text: "for Engineering", subtext: "cho Kỹ thuật" },
        { icon: Lightbulb, text: "MAE101", subtext: "Mã môn" },
      ],
    },
    {
      id: "prf192",
      code: "PRF192",
      title: "Programming Fundamentals",
      description: "Lập trình cơ bản từ A-Z",
      path: "/",
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      hoverGradient:
        "hover:from-purple-700 hover:via-pink-700 hover:to-rose-700",
      glowColor: "purple",
      icon: Code2,
      features: [
        { icon: Code2, text: "Programming", subtext: "Lập trình" },
        { icon: BookMarked, text: "Fundamentals", subtext: "Cơ bản" },
        { icon: Zap, text: "PRF192", subtext: "Mã môn" },
      ],
    },
    {
      id: "csi106",
      code: "CSI106",
      title: "Introduction to Computer Science",
      description: "Nhập môn khoa học máy tính",
      path: "/",
      gradient: "from-emerald-600 via-green-600 to-lime-600",
      hoverGradient:
        "hover:from-emerald-700 hover:via-green-700 hover:to-lime-700",
      glowColor: "emerald",
      icon: Cpu,
      features: [
        { icon: GraduationCap, text: "Introduction to", subtext: "Nhập môn" },
        { icon: Cpu, text: "Computer Science", subtext: "Khoa học MT" },
        { icon: FileText, text: "CSI106", subtext: "Mã môn" },
      ],
    },
    {
      id: "cea201",
      code: "CEA201",
      title: "Computer Organization and Architecture",
      description: "Kiến trúc & tổ chức máy tính",
      path: "/",
      gradient: "from-orange-600 via-amber-600 to-yellow-600",
      hoverGradient:
        "hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700",
      glowColor: "orange",
      icon: Binary,
      features: [
        { icon: Cpu, text: "Computer Organization", subtext: "Tổ chức MT" },
        { icon: Binary, text: "and Architecture", subtext: "Kiến trúc" },
        { icon: BookOpen, text: "CEA201", subtext: "Mã môn" },
      ],
    },
  ];

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearch = () => setSearchQuery("");

  const handleNavigate = (path: string) => navigate(path);
  const handleGoHome = () => navigate("/");

  const onCardKey = (e: KeyboardEvent<HTMLDivElement>, path: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-8 overflow-hidden">
      {/* Local styles (giữ nguyên animation của thiết kế) */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes glow-pulse { 0%,100%{opacity:.6} 50%{opacity:.9} }
        @keyframes shine { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(200%) skewX(-15deg)} }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,30px) scale(1.2)} 66%{transform:translate(-20px,-10px) scale(.9)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,-30px) scale(1.3)} 66%{transform:translate(20px,10px) scale(.95)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1) rotate(0)} 50%{transform:translate(0,0) scale(1.1) rotate(180deg)} }
        @keyframes fade-in-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slide-in-left { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scale-in { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        @keyframes icon-bounce { 0%,100%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-10px) rotate(-5deg)} 75%{transform:translateY(-10px) rotate(5deg)} }
        @keyframes sparkle-bounce { 0%,100%{transform:scale(1) rotate(0)} 25%{transform:scale(1.2) rotate(5deg)} 75%{transform:scale(1.2) rotate(-5deg)} }
        @keyframes search-glow { 0%,100%{ box-shadow:0 0 20px rgba(139,92,246,.3) } 50%{ box-shadow:0 0 30px rgba(139,92,246,.6) } }
        .animate-float{animation:float 3s ease-in-out infinite}
        .animate-glow-pulse{animation:glow-pulse 2s ease-in-out infinite}
        .animate-shine{animation:shine 2s infinite}
        .animate-blob1{animation:blob1 8s ease-in-out infinite}
        .animate-blob2{animation:blob2 10s ease-in-out infinite}
        .animate-blob3{animation:blob3 15s linear infinite}
        .animate-fade-in-up{animation:fade-in-up .7s ease-out}
        .animate-slide-in-left{animation:slide-in-left .6s ease-out}
        .animate-scale-in{animation:scale-in .5s ease-out}
        .animate-icon-bounce{animation:icon-bounce .6s ease-in-out}
        .animate-sparkle{animation:sparkle-bounce 2s ease-in-out infinite}
        .search-focused{animation:search-glow 2s ease-in-out infinite}
        .course-card{transition:all .4s cubic-bezier(.4,0,.2,1)}
        .course-card:hover{transform:translateY(-15px) scale(1.02)}
        .feature-item{opacity:0;transform:translateX(-20px);transition:all .4s ease-out}
        .feature-show{opacity:1;transform:translateX(0)}
        .feature-show:nth-child(1){transition-delay:.1s}
        .feature-show:nth-child(2){transition-delay:.2s}
        .feature-show:nth-child(3){transition-delay:.3s}
      `}</style>

      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob1" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob3" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <SnowfallEffect />

        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-fade-in-up">
          <button
            onClick={handleGoHome}
            className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Về trang chủ"
          >
            <Home className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-white font-medium">Trang chủ</span>
          </button>
          {/* ĐÃ BỎ ThemeToggle theo yêu cầu */}
        </div>

        {/* Title Section */}
        <div className="text-center mb-16 animate-slide-in-left">
          <div className="relative inline-block mb-6 animate-float">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl animate-glow-pulse" />
            </div>
            <div className="relative bg-gradient-to-br from-emerald-600 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Tài Liệu Môn Học
          </h1>

          <p className="text-gray-300 text-lg font-medium max-w-2xl mx-auto">
            Kho tài liệu chất lượng cao được phân loại theo từng môn học
          </p>

          {/* 🔎 Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div
              className={`relative group transition-all duration-300 ${
                isFocused ? "search-focused" : ""
              }`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/20 group-hover:border-purple-400/50 transition-all duration-300 overflow-hidden">
                {/* Animated tint on focus */}
                {isFocused && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10" />
                )}

                <div className="relative flex items-center p-4 gap-3">
                  <Search
                    className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                      isFocused ? "text-purple-400 scale-110" : "text-gray-400"
                    }`}
                  />

                  <input
                    type="text"
                    placeholder="Tìm kiếm môn học (VD: MAE101, Programming, Toán...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base font-medium"
                    aria-label="Tìm kiếm môn học"
                  />

                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group/clear"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-5 h-5 text-gray-400 group-hover/clear:text-white transition-colors duration-300" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search results count */}
            {searchQuery && (
              <div className="mt-3 text-center animate-fade-in-up">
                <p className="text-gray-300 text-sm">
                  Tìm thấy{" "}
                  <span className="text-purple-400 font-bold">
                    {filteredCourses.length}
                  </span>{" "}
                  kết quả
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
              const CourseIcon = course.icon;
              const isHover = hoveredCourse === course.id;
              return (
                <div
                  key={course.id}
                  className="course-card relative group cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredCourse(course.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                  onClick={() => handleNavigate(course.path)}
                  onKeyDown={(e) => onCardKey(e, course.path)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Mở môn ${course.code} - ${course.title}`}
                >
                  {/* Card glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${course.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                  />

                  <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden h-full">
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />

                    {/* Header with icon and code */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={isHover ? "animate-icon-bounce" : ""}>
                        <div
                          className={`absolute w-16 h-16 bg-gradient-to-br ${course.gradient} rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                        />
                        <div
                          className={`relative w-16 h-16 bg-gradient-to-br ${course.gradient} rounded-2xl flex items-center justify-center shadow-2xl`}
                        >
                          <CourseIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                        <span className="text-white font-bold text-lg">
                          {course.code}
                        </span>
                      </div>
                    </div>

                    {/* Title and description */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {course.title}
                      </h2>
                      <p className="text-gray-300 text-sm font-medium">
                        {course.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {course.features.map((feature, i) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div
                            key={`${course.id}-f-${i}`}
                            className={`flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 feature-item ${
                              isHover ? "feature-show" : ""
                            }`}
                          >
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${course.gradient} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                            >
                              <FeatureIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-sm leading-tight">
                                {feature.text}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {feature.subtext}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={() => handleNavigate(course.path)}
                      className={`relative w-full bg-gradient-to-r ${course.gradient} ${course.hoverGradient} h-12 text-base font-bold shadow-2xl transition-all duration-300 text-white flex items-center justify-center rounded-xl overflow-hidden group/btn active:scale-95`}
                      aria-label={`Vào ${course.code}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-shine" />
                      <span className="relative z-10 flex items-center gap-2">
                        Xem Tài Liệu
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-400">
                Không có môn học nào phù hợp với "
                <span className="text-purple-400 font-semibold">
                  {searchQuery}
                </span>
                "
              </p>
              <button
                onClick={clearSearch}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div
          className="text-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
        >
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-2xl border border-white/20">
            <div className="animate-sparkle">
              <Sparkles size={20} className="text-yellow-400 drop-shadow-lg" />
            </div>
            <p className="text-gray-200 font-medium">
              Tài liệu được cập nhật thường xuyên và đầy đủ nhất
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
