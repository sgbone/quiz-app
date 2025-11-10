import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Download,
  PencilLine,
  FileArchive,
  ExternalLink,
  Share2,
  CheckCircle2,
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type ProjectWithProfile = {
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
    {[...Array(60)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white/70 rounded-full animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 3 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: Math.random() * 0.5 + 0.3,
        }}
      />
    ))}
  </div>
);

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [p, setP] = useState<ProjectWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setMe(auth?.user?.id ?? null);

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          id, author_id, title, description, tags, thumb_url, zip_path, zip_size_bytes, created_at,
          profiles:author_id ( display_name, username, avatar_url )
        `
        )
        .eq("id", Number(id))
        .maybeSingle();
      if (!error) setP(data as any);
      setLoading(false);
    })();
  }, [id]);

  const authorName = useMemo(() => {
    if (!p?.profiles) return "Ẩn danh";
    return p.profiles.display_name || p.profiles.username || "Ẩn danh";
  }, [p]);

  const download = async () => {
    if (!p?.zip_path) return;
    const { data, error } = await supabase.storage
      .from("project-zips")
      .createSignedUrl(p.zip_path, 60);
    if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: p?.title ?? "Project", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white relative overflow-hidden">
        <StyleDefs />
        <Snowfall />
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl animate-pulse">
          Đang tải…
        </div>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white relative overflow-hidden">
        <StyleDefs />
        <Snowfall />
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
          Không tìm thấy dự án.
        </div>
      </div>
    );
  }

  const canEdit = me && me === p.author_id;

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
      <StyleDefs />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob1" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob3" />
      <Snowfall />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => nav(-1)}
            className="group inline-flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Quay lại
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={share}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 inline-flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
            {canEdit && (
              <button
                onClick={() => nav(`/project/edit/${p.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 rounded-xl border border-white/10 inline-flex items-center gap-2 shadow-lg"
              >
                <PencilLine className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="relative group overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl">
          {/* Hero */}
          <div className="relative h-72 bg-gradient-to-br from-blue-900/40 to-purple-900/40">
            {p.thumb_url ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <img src={p.thumb_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-white/70 text-sm">
                No thumbnail
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Floating title */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
              {p.profiles?.avatar_url ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img
                  src={p.profiles.avatar_url}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 grid place-items-center ring-2 ring-white/30">
                  <User className="w-6 h-6 text-white/80" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">
                  {p.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-white/80 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {authorName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(p.created_at).toLocaleDateString("vi-VN")}
                  </span>
                  {p.zip_size_bytes != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <FileArchive className="w-3.5 h-3.5" />
                      {(p.zip_size_bytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8">
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {p.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg text-xs text-blue-300 inline-flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" /> {t}
                  </span>
                ))}
              </div>
            )}

            {p.description && (
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-white/90 leading-relaxed whitespace-pre-line">
                  {p.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={download}
                className="relative px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold inline-flex items-center gap-2 overflow-hidden group/btn"
              >
                <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Download className="w-4 h-4" /> Tải File
              </button>
              <Link
                to="/project"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Về danh sách
              </Link>
              {copied && (
                <span className="inline-flex items-center gap-1 text-emerald-300 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Copied link!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleDefs() {
  return (
    <style>{`
      @keyframes fall { 0% { transform: translateY(-10px); opacity: 0.9; } 100% { transform: translateY(100vh); opacity: 0; } }
      @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(50px,30px) scale(1.2);} 66%{transform:translate(-20px,-10px) scale(0.9);} }
      @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-50px,-30px) scale(1.3);} 66%{transform:translate(20px,10px) scale(0.95);} }
      @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1) rotate(0deg);} 50% { transform: translate(0,0) scale(1.1) rotate(180deg);} }
      @keyframes shine { 0% { transform: translateX(-130%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
      .animate-fall { animation: fall linear infinite; }
      .animate-blob1 { animation: blob1 8s ease-in-out infinite; }
      .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
      .animate-blob3 { animation: blob3 15s linear infinite; }
      .animate-shine { animation: shine 1.6s infinite; }
    `}</style>
  );
}
