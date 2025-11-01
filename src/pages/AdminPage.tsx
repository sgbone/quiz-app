import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Upload,
  Key,
  FileText,
  Trash2,
  ListChecks,
  MessageSquare,
  Lock,
  Code,
  BellPlus,
} from "lucide-react";
import { parseQuizFromExcel } from "../utils/excelParser";
import { useAppStore } from "../store/quizStore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ConfirmModal from "../components/ConfirmModal";
// Kiểu dữ liệu cho đề thi trong danh sách
type QuizInList = {
  id: number;
  name: string;
};

const AdminPage = () => {
  // --- STATE MANAGEMENT ---
  const { quizList, fetchQuizList, importQuiz, deleteQuiz } = useAppStore(
    (state) => ({
      quizList: state.quizList,
      fetchQuizList: state.fetchQuizList,
      importQuiz: state.importQuiz,
      deleteQuiz: state.deleteQuiz,
    })
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quizName, setQuizName] = useState("");
  const [description, setDescription] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  }>({ type: "info", message: "Sẵn sàng..." });
  const [quizToDelete, setQuizToDelete] = useState<QuizInList | null>(null);

  const [notifContent, setNotifContent] = useState("");
  const [notifImageUrl, setNotifImageUrl] = useState("");
  const [notifLinkUrl, setNotifLinkUrl] = useState("");
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  useEffect(() => {
    fetchQuizList();
  }, [fetchQuizList]);

  // --- LOGIC HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quizName.trim() || !adminKey.trim()) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập tên đề, admin key và chọn file.",
      });
      return;
    }
    try {
      const questions = await parseQuizFromExcel(file);
      const result = await importQuiz(
        quizName,
        description,
        isProtected,
        questions,
        adminKey
      );
      setStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) {
        setQuizName("");
        setDescription("");
        setIsProtected(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Định dạng file Excel không hợp lệ.",
      });
    }
  };

  const handleDeleteClick = (quiz: QuizInList) => {
    if (!adminKey.trim()) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập Admin Key để thực hiện thao tác xóa!",
      });
      return;
    }
    setQuizToDelete(quiz);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    const result = await deleteQuiz(quizToDelete.id, adminKey);
    setStatus({
      type: result.success ? "success" : "error",
      message: result.message,
    });
    setQuizToDelete(null); // Đóng modal sau khi xóa
  };

  const handleSendNotification = async () => {
    if (!notifContent.trim() || !adminKey.trim()) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập Admin Key và nội dung thông báo.",
      });
      return;
    }

    setIsSendingNotif(true);
    setStatus({ type: "info", message: "Đang lấy danh sách người dùng..." });

    try {
      // 1. Lấy danh sách user ID qua Edge Function
      const { data: usersData, error: usersError } =
        await supabase.functions.invoke("get-all-users", {
          body: { adminKey },
        });
      if (usersError) throw new Error(`Lỗi lấy user: ${usersError.message}`);
      if (!usersData.success)
        throw new Error(
          usersData.message ||
            "Không thể lấy danh sách người dùng. Sai Admin Key?"
        );

      const userIds = usersData.userIds;
      if (userIds.length === 0) {
        setStatus({ type: "info", message: "Không có người dùng nào để gửi." });
        setIsSendingNotif(false);
        return;
      }

      setStatus({
        type: "info",
        message: `Đã tìm thấy ${userIds.length} người dùng. Chuẩn bị gửi...`,
      });

      // 2. Chuẩn bị "thùng hàng" thông báo
      const notificationsToInsert = userIds.map((id: string) => ({
        user_id: id,
        content: notifContent,
        image_url: notifImageUrl || null,
        link_url: notifLinkUrl || null,
      }));

      // 3. Nhờ "Đại sứ quán" gửi hộ
      const { error: sendError } = await supabase.functions.invoke(
        "send-bulk-notification",
        {
          body: {
            adminKey: adminKey,
            notificationsToInsert: notificationsToInsert,
          },
        }
      );

      if (sendError) throw new Error(`Lỗi gửi thông báo: ${sendError.message}`);

      setStatus({
        type: "success",
        message: `Đã gửi thông báo thành công đến ${userIds.length} người dùng!`,
      });
      setNotifContent("");
      setNotifImageUrl("");
      setNotifLinkUrl("");
    } catch (error: any) {
      setStatus({ type: "error", message: `Thất bại: ${error.message}` });
    } finally {
      setIsSendingNotif(false);
    }
  };

  // --- GIAO DIỆN ---
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative mb-8">
            <Link to="/" title="Về trang chủ" className="absolute top-0 left-0">
              <img
                src="/home.gif"
                alt="Home Page"
                className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200"
              />
            </Link>
            <div className="flex flex-col items-center justify-center gap-3 pt-12">
              <Code className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                Bảng Điều Khiển Admin
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Quản lý và import đề thi trắc nghiệm
            </p>
          </div>

          {/* Ô Nhập Admin Key và Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 max-w-xl mx-auto transition-colors duration-300">
            <div className="relative mb-4">
              <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Nhập Admin Key để thực hiện các thao tác"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div
              className={`p-3 rounded-lg text-center font-semibold text-sm transition-colors duration-300 ${
                status.type === "success"
                  ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                  : status.type === "error"
                  ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                  : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
              }`}
            >
              {status.message}
            </div>
          </div>

          {/* Layout 2 Cột */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột 1: Import Đề Mới */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Import Đề Mới
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Tải lên từ file Excel
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <FileText className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tên đề thi"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  <textarea
                    placeholder="Mô tả ngắn về đề thi (tùy chọn)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white focus:border-indigo-500 outline-none transition resize-none"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="protect-checkbox"
                      className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Lock size={16} />
                      Yêu cầu mật khẩu chung
                    </label>
                    <input
                      type="checkbox"
                      id="protect-checkbox"
                      checked={isProtected}
                      onChange={(e) => setIsProtected(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all"
                >
                  Chọn File Excel & Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            {/* Cột 2: Quản Lý Đề Thi */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ListChecks className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Quản Lý Đề Thi
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Tổng cộng: {quizList.length} đề
                  </p>
                </div>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {quizList.length > 0 ? (
                  quizList.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-300"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {quiz.name}
                      </span>
                      <button
                        onClick={() => handleDeleteClick(quiz)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Xóa đề"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Chưa có đề nào trong database.
                  </p>
                )}
              </div>
            </div>
            {/* Cột 3: Gửi Thông Báo */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <BellPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Gửi Thông Báo
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Gửi đến tất cả người dùng trong hệ thống.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <textarea
                  placeholder="Nội dung thông báo"
                  value={notifContent}
                  onChange={(e) => setNotifContent(e.target.value)}
                  rows={4}
                  className="w-full pl-4 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition"
                />
                <input
                  type="text"
                  placeholder="URL hình ảnh"
                  value={notifImageUrl}
                  onChange={(e) => setNotifImageUrl(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 ..."
                />
                <input
                  type="text"
                  placeholder="URL liên kết"
                  value={notifLinkUrl}
                  onChange={(e) => setNotifLinkUrl(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition"
                />
                <button
                  onClick={handleSendNotification}
                  disabled={isSendingNotif}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {isSendingNotif ? "Đang gửi..." : "Gửi Thông Báo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <ConfirmModal
        isOpen={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn đề "${quizToDelete?.name}" không?`}
      />
    </>
  );
};

export default AdminPage;
