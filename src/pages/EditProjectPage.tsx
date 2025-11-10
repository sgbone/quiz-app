import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  FileArchive,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const sanitizeFilename = (name: string) => {
  const noAccent = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccent
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

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
};

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [_me, setMe] = useState<string | null>(null);
  const [p, setP] = useState<ProjectRow | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");

  const [thumbNew, setThumbNew] = useState<File | null>(null);
  const [fileNew, setFileNew] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // load project & guard
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id ?? null;
      setMe(uid);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (!error && data) {
        setP(data as any);
        setTitle(data.title || "");
        setDesc(data.description || "");
        setTags((data.tags || []).join(", "));
        // only author can edit
        if (!uid || uid !== data.author_id)
          nav(`/project/${id}`, { replace: true });
      } else {
        nav("/project", { replace: true });
      }
    })();
  }, [id, nav]);

  // preview thumbnail
  useEffect(() => {
    if (!thumbNew) return setThumbPreview(null);
    const reader = new FileReader();
    reader.onloadend = () => setThumbPreview(reader.result as string);
    reader.readAsDataURL(thumbNew);
  }, [thumbNew]);

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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p) return;
    setErr(null);

    if (!title.trim()) return setErr("Thiếu tiêu đề");

    // validate archive if chosen
    if (fileNew) {
      const lower = fileNew.name.toLowerCase();
      const isZip = lower.endsWith(".zip");
      const isRar = lower.endsWith(".rar");
      if (!isZip && !isRar)
        return setErr("File nén chỉ chấp nhận .zip hoặc .rar");
      if (fileNew.size > 50 * 1024 * 1024)
        return setErr("Kích thước file vượt 50MB");
    }

    setBusy(true);
    try {
      let thumb_url = p.thumb_url;
      let zip_path = p.zip_path;
      let zip_size_bytes = p.zip_size_bytes;

      if (thumbNew) {
        await deleteStorageIfAny(thumb_url, null);
        const path = `${p.author_id}/${crypto.randomUUID()}-${sanitizeFilename(
          thumbNew.name
        )}`;
        const { error: upErr } = await supabase.storage
          .from("project-thumbs")
          .upload(path, thumbNew, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage
          .from("project-thumbs")
          .getPublicUrl(path);
        thumb_url = data.publicUrl;
      }

      if (fileNew) {
        await deleteStorageIfAny(null, zip_path ?? null);
        const safe = sanitizeFilename(fileNew.name);
        const pathFile = `${p.author_id}/${crypto.randomUUID()}-${safe}`;
        const contentType = fileNew.name.toLowerCase().endsWith(".rar")
          ? "application/vnd.rar"
          : "application/zip";
        const { error: fErr } = await supabase.storage
          .from("project-zips")
          .upload(pathFile, fileNew, {
            cacheControl: "3600",
            upsert: false,
            contentType,
          });
        if (fErr) throw fErr;
        zip_path = pathFile;
        zip_size_bytes = fileNew.size;
      }

      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error: updErr } = await supabase
        .from("projects")
        .update({
          title,
          description: desc,
          tags: tagArray,
          thumb_url,
          zip_path,
          zip_size_bytes,
        })
        .eq("id", p.id);
      if (updErr) throw updErr;

      setDone(true);
      setTimeout(() => nav(`/project/${p.id}`), 800);
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Cập nhật thất bại.");
    } finally {
      setBusy(false);
    }
  };

  if (!p) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => nav(-1)}
            className="group mb-6 inline-flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 hover:gap-3"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Chỉnh sửa dự án
          </h1>
          <p className="text-white/50 text-sm">Dự án #{p.id}</p>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="space-y-6">
          {/* Info Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              Thông tin cơ bản
            </h2>

            <div className="space-y-5">
              {/* Title */}
              <div className="group">
                <label className="block text-sm font-medium mb-2 text-white/80 group-focus-within:text-white transition-colors">
                  Tiêu đề <span className="text-pink-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-white/30"
                  placeholder="Nhập tiêu đề dự án..."
                />
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-sm font-medium mb-2 text-white/80 group-focus-within:text-white transition-colors">
                  Mô tả
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 resize-none placeholder:text-white/30"
                  placeholder="Mô tả chi tiết về dự án..."
                />
              </div>

              {/* Tags */}
              <div className="group">
                <label className="block text-sm font-medium mb-2 text-white/80 group-focus-within:text-white transition-colors">
                  Tags{" "}
                  <span className="text-white/40 ml-2 text-xs">
                    (phẩy , để phân tách)
                  </span>
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-white/30"
                  placeholder="react, typescript, web-design..."
                />
              </div>
            </div>
          </div>

          {/* Files Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              Tệp đính kèm
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium mb-3 text-white/80">
                  Ảnh minh họa
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbNew(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id="thumb-upload"
                  />
                  <label
                    htmlFor="thumb-upload"
                    className="block cursor-pointer"
                  >
                    {thumbPreview || p.thumb_url ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-all duration-300">
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <img
                          src={thumbPreview || p.thumb_url || ""}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Upload className="w-8 h-8" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border-2 border-dashed border-white/20 bg-white/5 group-hover:border-purple-500/50 group-hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-12 h-12 text-white/40 group-hover:text-white/60 transition-colors" />
                        <span className="text-sm text-white/60">Chọn ảnh</span>
                      </div>
                    )}
                  </label>
                  {(thumbNew || thumbPreview) && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbNew(null);
                        setThumbPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Zip Upload */}
              <div>
                <label className="block text-sm font-medium mb-3 text-white/80">
                  File nén (.zip/.rar)
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".zip,.rar,application/zip,application/vnd.rar"
                    onChange={(e) => setFileNew(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="block cursor-pointer">
                    <div className="aspect-video rounded-xl border-2 border-dashed border-white/20 bg-white/5 group-hover:border-purple-500/50 group-hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                      <FileArchive className="w-12 h-12 text-white/40 group-hover:text-white/60 transition-colors" />
                      <span className="text-sm text-white/60">
                        {fileNew ? fileNew.name : "Chọn file"}
                      </span>
                      {fileNew && (
                        <span className="text-xs text-white/40">
                          {(fileNew.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </label>
                  {fileNew && (
                    <button
                      type="button"
                      onClick={() => setFileNew(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {err && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
              {err}
            </div>
          )}
          {done && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5" /> Lưu thành công!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-60 disabled:hover:shadow-none"
          >
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[10px] px-6 py-4 transition-all duration-300 group-hover:bg-transparent">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[10px]"></div>
              <div className="relative flex items-center justify-center gap-3 text-white font-semibold">
                <Save className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                <span>{busy ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </div>
            </div>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .delay-1000 { animation-delay: 1s; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-2 { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out, slide-in-from-top-2 0.3s ease-out; }
      `}</style>
    </div>
  );
}
