import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Upload,
  Image as ImageIcon,
  FileArchive,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  FileText,
  Tag,
  AlertCircle,
  Loader,
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Bỏ dấu + lọc chỉ [a-z0-9._-]
const sanitizeFilename = (name: string) => {
  const noAccent = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccent
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const SnowfallEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full animate-fall"
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

export default function UploadProjectPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState<string>("");

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    if (thumbFile) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbPreview(reader.result as string);
      reader.readAsDataURL(thumbFile);
    } else {
      setThumbPreview(null);
    }
  }, [thumbFile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!title.trim()) return setErr("Thiếu tiêu đề");
    if (!zipFile) return setErr("Chưa chọn file nén (.zip hoặc .rar)");

    const rawName = zipFile.name;
    const lower = rawName.toLowerCase();
    const isZip = lower.endsWith(".zip");
    const isRar = lower.endsWith(".rar");
    if (!isZip && !isRar) return setErr("Chỉ chấp nhận .zip hoặc .rar");
    if (zipFile.size > 50 * 1024 * 1024)
      return setErr("Kích thước file vượt 50MB");

    setBusy(true);
    try {
      // Session
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        setErr("Phiên đăng nhập đã hết, vui lòng đăng nhập lại.");
        navigate("/login", { state: { from: "/project/upload" } });
        setBusy(false);
        return;
      }

      // Upload thumbnail (public)
      let thumbUrl: string | null = null;
      if (thumbFile) {
        const thumbPath = `${userId}/${crypto.randomUUID()}-${sanitizeFilename(
          thumbFile.name
        )}`;
        const { error: upErr } = await supabase.storage
          .from("project-thumbs")
          .upload(thumbPath, thumbFile, {
            cacheControl: "3600",
            upsert: false,
          });
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from("project-thumbs")
          .getPublicUrl(thumbPath);
        thumbUrl = data.publicUrl;
      }

      // Upload file nén (private)
      const filePath = `${userId}/${crypto.randomUUID()}-${sanitizeFilename(
        rawName
      )}`;
      const contentType = isRar ? "application/vnd.rar" : "application/zip";
      const { error: zipErr } = await supabase.storage
        .from("project-zips")
        .upload(filePath, zipFile, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });
      if (zipErr) throw zipErr;

      // Insert DB
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { error: insErr } = await supabase.from("projects").insert({
        author_id: userId,
        title,
        description: desc,
        tags: tagArray,
        thumb_url: thumbUrl,
        zip_path: filePath,
        zip_size_bytes: zipFile.size,
      });
      if (insErr) throw insErr;

      setDone(true);
      setTimeout(() => navigate("/project"), 800);
    } catch (e: any) {
      console.error("Upload error:", e);
      setErr(e.message || "Không thể upload file. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
        <style>{`
          @keyframes fall { 0% { transform: translateY(-10px); opacity: 0.8; } 100% { transform: translateY(100vh); opacity: 0; } }
          @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(50px,30px) scale(1.2);} 66%{transform:translate(-20px,-10px) scale(0.9);} }
          @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-50px,-30px) scale(1.3);} 66%{transform:translate(20px,10px) scale(0.95);} }
          .animate-fall { animation: fall linear infinite; }
          .animate-blob1 { animation: blob1 8s ease-in-out infinite; }
          .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
        `}</style>

        {/* Animated blobs */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob1" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob2" />
        </div>

        <SnowfallEffect />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Yêu cầu đăng nhập
            </h2>
            <p className="text-gray-300 mb-8">
              Vui lòng đăng nhập để đăng dự án của bạn
            </p>
            <button
              onClick={() =>
                navigate("/login", { state: { from: "/project/upload" } })
              }
              className="w-full px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 rounded-xl text-white font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden text-white">
      <style>{`
        @keyframes fall { 0% { transform: translateY(-10px); opacity: 0.8; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes glow-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 0.9; } }
        @keyframes shine { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(50px,30px) scale(1.2);} 66%{transform:translate(-20px,-10px) scale(0.9);} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-50px,-30px) scale(1.3);} 66%{transform:translate(20px,10px) scale(0.95);} }
        @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1) rotate(0deg);} 50% { transform: translate(0,0) scale(1.1) rotate(180deg);} }
        @keyframes fade-in-up { from{opacity:0; transform: translateY(30px);} to{opacity:1; transform: translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fall { animation: fall linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-shine { animation: shine 2s infinite; }
        .animate-blob1 { animation: blob1 8s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 15s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.7s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }
        .file-upload-area { transition: all 0.3s ease; }
        .file-upload-area:hover { transform: translateY(-2px); }
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob1" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob3" />
      </div>

      <div className="relative z-10">
        <SnowfallEffect />

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in-up">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 mb-6"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Quay lại
            </button>

            {/* Title Section */}
            <div className="text-center">
              <div className="relative inline-block mb-6 animate-float">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full blur-xl animate-glow-pulse" />
                </div>
                <div className="relative bg-gradient-to-br from-fuchsia-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Upload className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                Đăng Dự Án (.zip /.rar ≤ 50MB)
              </h1>
              <p className="text-gray-300 text-base">
                Chia sẻ dự án của bạn với cộng đồng
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Main Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 via-pink-500/20 to-rose-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                {/* Title Input */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-white font-semibold mb-3">
                    <FileText className="w-5 h-5 text-fuchsia-400" />
                    Tiêu đề dự án <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Website E-Commerce Full Stack"
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none border-2 border-white/10 focus:border-fuchsia-400/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-white font-semibold mb-3">
                    <FileText className="w-5 h-5 text-pink-400" />
                    Mô tả dự án
                  </label>
                  <div className="relative">
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Mô tả chi tiết về dự án của bạn..."
                      rows={5}
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none border-2 border-white/10 focus:border-pink-400/50 transition-all duration-300 resize-none"
                    />
                  </div>
                </div>

                {/* Tags Input */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-white font-semibold mb-3">
                    <Tag className="w-5 h-5 text-rose-400" />
                    Tags (phẩy để phân tách)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="VD: React, Node.js, MongoDB"
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none border-2 border-white/10 focus:border-rose-400/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                      Ảnh minh họa
                    </label>
                    <label className="block cursor-pointer file-upload-area">
                      <div className="relative bg-white/5 hover:bg-white/10 rounded-xl p-6 border-2 border-dashed border-white/20 hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
                        {thumbPreview ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbPreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <p className="text-sm text-gray-300 text-center truncate">
                              {thumbFile?.name}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-300">
                              Click để chọn ảnh
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, GIF
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setThumbFile(e.target.files?.[0] ?? null)
                          }
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Zip Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-white font-semibold mb-3">
                      <FileArchive className="w-5 h-5 text-purple-400" />
                      File dự án <span className="text-pink-400">*</span>
                    </label>
                    <label className="block cursor-pointer file-upload-area">
                      <div className="relative bg-white/5 hover:bg-white/10 rounded-xl p-6 border-2 border-dashed border-white/20 hover:border-purple-400/50 transition-all duration-300 overflow-hidden">
                        {zipFile ? (
                          <div className="text-center">
                            <FileArchive className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm text-white font-semibold truncate">
                              {zipFile.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {(zipFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FileArchive className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-300">
                              Click để chọn file
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ZIP, RAR (≤ 50MB)
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".zip,.rar,application/zip,application/vnd.rar"
                          onChange={(e) =>
                            setZipFile(e.target.files?.[0] ?? null)
                          }
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {err && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300">{err}</p>
                  </div>
                )}

                {/* Success Message */}
                {done && (
                  <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-300 font-semibold">
                      Đăng thành công! Đang chuyển hướng...
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="relative w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-700 hover:via-pink-700 hover:to-rose-700 disabled:opacity-60 disabled:cursor-not-allowed h-14 text-lg font-bold shadow-2xl transition-all duration-300 text-white flex items-center justify-center rounded-xl overflow-hidden group/btn active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-shine" />
                  <span className="relative z-10 flex items-center gap-2">
                    {busy ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        Đăng Dự Án
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1 animate-float" />
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="font-semibold text-white">
                    Lưu ý khi đăng dự án:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>File nén chỉ chấp nhận định dạng .zip hoặc .rar</li>
                    <li>Kích thước tối đa 50MB</li>
                    <li>Ảnh minh họa giúp dự án của bạn thu hút hơn</li>
                    <li>Tags giúp người khác dễ dàng tìm kiếm dự án</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
