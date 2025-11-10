import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Server,
  BarChart3,
  Computer,
  Lightbulb,
  BookOpen,
  FileText,
  GraduationCap,
  FolderGit2,
  Code2,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import SnowfallEffect from "../components/SnowfallEffect";

/**
 * WelcomePage (merged)
 * - Giao diện redesign: nền gradient + blob, tuyết rơi, card 3 mục, hiệu ứng shine/glow
 * - Dùng navigate() để chuyển trang như bản gốc
 * - Dùng ThemeToggle/SnowfallEffect thật (không còn mock)
 * - Không dùng framer-motion để giữ nhẹ & bám sát redesign gốc
 */

type NavCard = {
  id: number;
  title: string;
  description: string;
  path: string;
  gradient: string;
  hoverGradient: string;
  glowColor: string;
  icon: any;
  features: { icon: any; text: string; color: string }[];
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const navigationCards: NavCard[] = [
    {
      id: 1,
      title: "Chữa Đề",
      description: "Nơi giúp bạn chữa đề để thi tự tin hơn",
      path: "/select-exam",
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      hoverGradient:
        "hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700",
      glowColor: "blue",
      icon: Computer,
      features: [
        {
          icon: BrainCircuit,
          text: "Câu hỏi đa dạng",
          color: "from-green-500 to-emerald-600",
        },
        {
          icon: Server,
          text: "Ngân hàng đề đa dạng",
          color: "from-blue-500 to-cyan-600",
        },
        {
          icon: BarChart3,
          text: "Giao diện dễ dùng",
          color: "from-purple-500 to-pink-600",
        },
      ],
    },
    {
      id: 2,
      title: "Tài Liệu",
      description: "Kho tài liệu môn học chất lượng cao",
      path: "/docs",
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      hoverGradient:
        "hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700",
      glowColor: "emerald",
      icon: BookOpen,
      features: [
        {
          icon: FileText,
          text: "Tài liệu chuẩn xác",
          color: "from-orange-500 to-red-600",
        },
        {
          icon: GraduationCap,
          text: "Phân loại theo môn",
          color: "from-violet-500 to-purple-600",
        },
        {
          icon: Sparkles,
          text: "Cập nhật liên tục",
          color: "from-pink-500 to-rose-600",
        },
      ],
    },
    {
      id: 3,
      title: "Dự Án",
      description: "Thư viện project thực tế và sáng tạo",
      path: "/project",
      gradient: "from-fuchsia-600 via-pink-600 to-rose-600",
      hoverGradient:
        "hover:from-fuchsia-700 hover:via-pink-700 hover:to-rose-700",
      glowColor: "fuchsia",
      icon: FolderGit2,
      features: [
        {
          icon: Code2,
          text: "Code chuẩn chỉnh",
          color: "from-cyan-500 to-blue-600",
        },
        {
          icon: Rocket,
          text: "Ý tưởng đột phá",
          color: "from-amber-500 to-orange-600",
        },
        {
          icon: Lightbulb,
          text: "Dễ dàng tái sử dụng",
          color: "from-yellow-500 to-amber-600",
        },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, 30px) scale(1.2); }
          66% { transform: translate(-20px, -10px) scale(0.9); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, -30px) scale(1.3); }
          66% { transform: translate(20px, 10px) scale(0.95); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(0, 0) scale(1.1) rotate(180deg); }
        }
        @keyframes icon-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes sparkle-bounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(5deg); }
          75% { transform: scale(1.2) rotate(-5deg); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-shine { animation: shine 2s infinite; }
        .animate-blob1 { animation: blob1 8s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 15s linear infinite; }
        .animate-icon-wiggle { animation: icon-wiggle 0.5s ease-in-out; }
        .animate-sparkle { animation: sparkle-bounce 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.7s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .card-hover:hover { transform: translateY(-10px); }
        .card-hover { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .feature-item {
          opacity: 0;
          transform: translateX(-20px);
        }
        .feature-show {
          animation: slide-in 0.5s ease-out forwards;
        }
        .feature-show:nth-child(1) { animation-delay: 0.1s; }
        .feature-show:nth-child(2) { animation-delay: 0.2s; }
        .feature-show:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob1" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob3" />
      </div>

      <div className="w-full max-w-6xl relative z-10 animate-fade-in-up">
        <SnowfallEffect />

        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0"></div>

          <div className="relative inline-block mb-6 animate-float">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl animate-glow-pulse" />
            </div>
            <img
              src="/DoanhNhanFPTU.png"
              alt="App Logo"
              width={80}
              height={80}
              className="mx-auto relative z-10 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Chào Mừng Đến Với Chữa Đề
          </h1>

          <p className="text-gray-300 text-lg font-medium">
            Chọn hướng đi phù hợp với mục tiêu học tập của bạn ✨
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {navigationCards.map((card, index) => {
            const CardIcon = card.icon;
            return (
              <div
                key={card.id}
                className="relative group cursor-pointer card-hover"
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleNavigate(card.path)}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Card glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
                />

                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/20 overflow-hidden">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />

                  {/* Icon section */}
                  <div className="relative mb-6">
                    <div
                      className={`${
                        hoveredCard === card.id ? "animate-icon-wiggle" : ""
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div
                        className={`relative w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-2xl`}
                      >
                        <CardIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {card.title}
                    </h2>
                    <p className="text-gray-300 text-sm">{card.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {card.features.map((feature, i) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 feature-item ${
                            hoveredCard === card.id ? "feature-show" : ""
                          }`}
                        >
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
                          >
                            <FeatureIcon className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-white">
                            {feature.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleNavigate(card.path)}
                    className={`relative w-full bg-gradient-to-r ${card.gradient} ${card.hoverGradient} h-12 text-base font-bold shadow-2xl transition-all duration-300 text-white flex items-center justify-center rounded-xl overflow-hidden group/btn active:scale-95`}
                    aria-label={`Đi tới ${card.title}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shine" />
                    <span className="relative z-10 flex items-center gap-2">
                      Khám Phá Ngay
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer message */}
        <div
          className="text-center mt-8 text-sm flex items-center justify-center gap-2 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
        >
          <div className="animate-sparkle">
            <Sparkles size={20} className="text-yellow-400 drop-shadow-lg" />
          </div>
          <p className="text-gray-200 font-medium">
            Hành trình học tập hiệu quả bắt đầu từ đây
          </p>
        </div>
      </div>
    </div>
  );
}
