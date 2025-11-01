import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuthStore } from "../store/authStore";

export const useUpload = (bucketName: "avatars" | "notifications") => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile } = useAuthStore();

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setIsUploading(true);
    setError(null);
    try {
      const user = useAuthStore.getState().session?.user;
      if (!user) throw new Error("Bạn phải đăng nhập để upload file.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath =
        bucketName === "avatars" ? `${user.id}/${fileName}` : fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (bucketName === "avatars") {
        await updateProfile({ avatar_url: publicUrl });
      }

      setIsUploading(false);
      return publicUrl;
    } catch (e: any) {
      console.error("Upload Error:", e);
      const errorMessage = e.message.includes("Bucket not found")
        ? `Lỗi: Không tìm thấy kho chứa '${bucketName}'. Bạn đã tạo nó chưa?`
        : `Lỗi upload: ${e.message}`;
      setError(errorMessage);
      setIsUploading(false);
      return null;
    }
  };
  return { isUploading, error, uploadFile };
};
