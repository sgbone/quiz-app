import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  User,
  Download,
  ExternalLink,
  Sparkles,
  FolderGit2,
  LogIn,
  Hash,
  Trash2,
  Edit3,
  FileArchive,
  TrendingUp,
  Clock,
  ListOrdered,
  X,
  Share2,
  Check,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type ProjectRow = {
  id: number;
  author_id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  thumb_url: string | null;
  zip_path: string | null;
  zip_size_bytes: number | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const Snowfall = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white/60 rounded-full animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 3 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: Math.random() * 0.4 + 0.2,
        }}
      />
    ))}
  </div>
);

export default function ProjectPage() {
  const nav = useNavigate();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest">(
    "default"
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth?.user?.id ?? null);

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          id, author_id, title, description, tags, thumb_url, zip_path, zip_size_bytes, created_at,
          profiles:author_id ( display_name, username, avatar_url )
        `
        )
        .order("id", { ascending: true });

      if (!error && data) setProjects(data as any);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let arr = projects.filter((p) => {
      const authorName = p.profiles?.display_name || p.profiles?.username || "";
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        authorName.toLowerCase().includes(q)
      );
    });

    if (sortBy === "newest") {
      arr = [...arr].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      arr = [...arr].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    return arr;
  }, [projects, searchQuery, sortBy]);

  const isEmpty = projects.length === 0;

  const handleLogin = () => nav("/login", { state: { from: "/project" } });
  const openUpload = () => nav("/project/upload");

  const downloadZip = async (zip_path: string | null) => {
    if (!zip_path) return;
    const { data, error } = await supabase.storage
      .from("project-zips")
      .createSignedUrl(zip_path, 60)
      .getPublicUrl(zip_path);
    if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const openConfirm = (p: ProjectRow) => {
    setToDelete(p);
    setDelError(null);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setToDelete(null);
  };

  const deleteStorageIfAny = async (
    thumbUrl?: string | null,
    zipPath?: string | null
  ) => {
    if (thumbUrl) {
      try {
        const marker = "/project-thumbs/";
        const i = thumbUrl.indexOf(marker);
        if (i !== -1) {
          const path = thumbUrl.substring(i + marker.length);
          await supabase.storage.from("project-thumbs").remove([path]);
        }
      } catch {}
    }
    if (zipPath) {
      try {
        await supabase.storage.from("project-zips").remove([zipPath]);
      } catch {}
    }
  };

  const handleDeleteProject = async () => {
    if (!userId || !toDelete || userId !== toDelete.author_id) return;
    setDeleting(true);
    setDelError(null);
    try {
      await deleteStorageIfAny(
        toDelete.thumb_url ?? null,
        toDelete.zip_path ?? null
      );
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", toDelete.id);
      if (error) throw error;
      setProjects((prev) => prev.filter((x) => x.id !== toDelete.id));
      closeConfirm();
    } catch (e: any) {
      setDelError(e.message || "Xóa thất bại, thử lại sau.");
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async (projectId: number) => {
    const url = `${window.location.origin}/project/${projectId}`;
    try {
      // 1) Mobile/web hỗ trợ Web Share
      if (navigator.share) {
        await navigator.share({ title: "Project", url });
        return;
      }
      // 2) HTTPS + Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // 3) Fallback: chọn-copy tạm bằng textarea (kể cả http)
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
      alert("Copy thất bại. Bạn có thể sao chép thủ công:\n" + url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-4 border-transparent border-t-fuchsia-500 rounded-full animate-spin"
              style={{
                animationDuration: "1.2s",
                animationDirection: "reverse",
              }}
            ></div>
            <div
              className="absolute inset-4 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"
              style={{ animationDuration: "0.8s" }}
            ></div>
          </div>
          <p className="text-xl font-semibold text-white/80 animate-pulse">
            Đang tải dự án...
          </p>
        </div>
      </div>
    );
  }

  const getSortIcon = () => {
    switch (sortBy) {
      case "newest":
        return <TrendingUp className="w-4 h-4" />;
      case "oldest":
        return <Clock className="w-4 h-4" />;
      default:
        return <ListOrdered className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 overflow-hidden text-white">
      <style>{`
        @keyframes fall { 0% { transform: translateY(-10px); opacity: 0.8; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes glow {0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.3)}50%{box-shadow:0 0 40px rgba(168,85,247,0.6)}}
        @keyframes shimmer {0%{transform:translateX(-100%) rotate(45deg)}100%{transform:translateX(200%) rotate(45deg)}}
        .animate-fall{animation:fall linear infinite}
        .animate-float{animation:float 3s ease-in-out infinite}
        .animate-glow{animation:glow 2s ease-in-out infinite}
        .group:hover .shimmer{animation:shimmer 0.8s ease-in-out}
        .card-hover{transition:all 0.4s cubic-bezier(0.4,0,0.2,1)}
        .card-hover:hover{transform:translateY(-8px) scale(1.02)}
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <Snowfall />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-8 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
                <FolderGit2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Thư Viện Dự Án
          </h1>

          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Khám phá và tải về các dự án sáng tạo từ cộng đồng
            <Sparkles className="inline w-5 h-5 ml-2 text-yellow-400 animate-pulse" />
          </p>

          <div className="flex items-center justify-center gap-4">
            {userId ? (
              <button
                onClick={() => nav("/project/upload")}
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 overflow-hidden"
              >
                <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                  Đăng dự án của bạn
                </span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 overflow-hidden"
              >
                <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                <span className="relative flex items-center gap-2">
                  <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  Đăng nhập để đăng dự án
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center shadow-2xl hover:border-white/20 transition-all duration-500">
              <div className="w-28 h-28 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30 animate-float">
                <FolderGit2 className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Chưa có dự án nào
              </h2>
              {!userId ? (
                <>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Hãy đăng nhập để trở thành người đầu tiên chia sẻ dự án!
                  </p>
                  <button
                    onClick={handleLogin}
                    className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 overflow-hidden"
                  >
                    <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                    <span className="relative">Đăng Nhập Ngay</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Bạn đã đăng nhập. Chưa có project nào — hãy vào trang upload
                    để đăng dự án của bạn!
                  </p>
                  <button
                    onClick={openUpload}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Tới trang Upload
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search + Filter + Grid */}
        {!isEmpty && (
          <>
            <div className="mb-10 flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="group relative bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/20">
                  <div className="flex items-center gap-4 px-6 py-4">
                    <Search className="w-5 h-5 text-violet-400 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc người đăng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-white/60 hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="lg:w-64">
                <div className="group relative bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-xl hover:shadow-fuchsia-500/20">
                  <div className="flex items-center gap-3 px-6 py-4">
                    <div className="text-fuchsia-400 transition-transform group-hover:scale-110">
                      {getSortIcon()}
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="flex-1 bg-transparent text-white outline-none cursor-pointer font-medium appearance-none pr-8"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' opacity='0.6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="default" className="bg-slate-900">
                        Mặc định (ID)
                      </option>
                      <option value="newest" className="bg-slate-900">
                        Mới nhất
                      </option>
                      <option value="oldest" className="bg-slate-900">
                        Cũ nhất
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filtered.length === 0 ? (
                <div className="col-span-full">
                  <div className="text-center py-20 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10">
                    <div className="text-7xl mb-4 opacity-50">🔍</div>
                    <p className="text-white/70 text-xl font-medium mb-2">
                      Không tìm thấy dự án nào
                    </p>
                    <p className="text-white/50 text-sm">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                </div>
              ) : (
                filtered.map((p) => {
                  const authorName =
                    p.profiles?.display_name ||
                    p.profiles?.username ||
                    "Ẩn danh";
                  return (
                    <div key={p.id} className="group relative card-hover">
                      {/* Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-500" />

                      <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl h-full flex flex-col group-hover:border-white/30 transition-all duration-300">
                        {/* Thumbnail */}
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-indigo-900/30 to-violet-900/30">
                          {p.thumb_url ? (
                            <img
                              src={p.thumb_url}
                              alt={p.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center">
                              <div className="text-center">
                                <FileArchive className="w-16 h-16 mx-auto mb-3 text-white/20" />
                                <p className="text-white/40 text-sm font-medium">
                                  No thumbnail
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                          {/* ID */}
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-xl rounded-xl text-xs font-bold text-white border border-white/20 shadow-lg">
                              <Hash className="w-3.5 h-3.5" /> {p.id}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-1">
                            {p.title}
                          </h3>
                          <p className="text-white/60 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                            {p.description || "Không có mô tả"}
                          </p>

                          {/* Tags */}
                          {p.tags && p.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-5">
                              {p.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-xl text-xs text-violet-200 font-semibold hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                              {p.tags.length > 3 && (
                                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 font-semibold">
                                  +{p.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 mb-5 pb-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              {p.profiles?.avatar_url ? (
                                <img
                                  src={p.profiles.avatar_url}
                                  alt={authorName}
                                  className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/30"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center ring-2 ring-violet-500/30">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                              <span className="font-semibold text-white/80">
                                {authorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(p.created_at).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadZip(p.zip_path);
                              }}
                              className="group/btn relative flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 overflow-hidden"
                            >
                              <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"></div>
                              <span className="relative flex items-center justify-center gap-2">
                                <Download className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
                                Tải
                              </span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(p.id);
                              }}
                              className="group/share relative px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                              title="Chia sẻ"
                            >
                              {copiedId === p.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Share2 className="w-4 h-4 transition-transform group-hover/share:rotate-12" />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nav(`/project/${p.id}`);
                              }}
                              className="group/link relative px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                              title="Xem chi tiết"
                            >
                              <ExternalLink className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                            </button>

                            {userId === p.author_id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nav(`/project/edit/${p.id}`);
                                  }}
                                  className="group/edit relative px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                  title="Chỉnh sửa"
                                >
                                  <Edit3 className="w-4 h-4 transition-transform group-hover/edit:rotate-12" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openConfirm(p);
                                  }}
                                  className="group/del relative px-4 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40"
                                  title="Xóa dự án"
                                >
                                  <Trash2 className="w-4 h-4 transition-transform group-hover/del:rotate-12" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Stats Footer */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-white/80 font-semibold text-lg">
                  Hiển thị {filtered.length} / {projects.length} dự án
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmOpen && toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeConfirm}
          />
          <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 pointer-events-none" />

            <div className="relative p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/20">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Xóa dự án?</h3>
                  <p className="text-white/60 text-sm mt-1">
                    Hành động không thể hoàn tác
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-white/80 leading-relaxed">
                  Bạn sắp xóa dự án
                  <span className="font-bold text-white">
                    {" "}
                    "{toDelete.title}"
                  </span>
                  . Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              {delError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-300 text-sm font-medium">{delError}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={closeConfirm}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Đang xóa..." : "Xóa luôn"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
