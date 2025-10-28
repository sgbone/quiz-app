import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  Key,
  FileText,
  Trash2,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { parseQuizFromExcel } from "../utils/excelParser";
import { useAppStore } from "../store/quizStore";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AdminPage = () => {
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
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  }>({ type: "info", message: "Sẵn sàng..." });

  useEffect(() => {
    fetchQuizList();
  }, [fetchQuizList]);

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
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Định dạng file Excel không hợp lệ.",
      });
    }
  };

  const handleDelete = async (quizId: number, quizName: string) => {
    if (!adminKey.trim()) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập Admin Key để thực hiện thao tác xóa!",
      });
      return;
    }
    if (
      window.confirm(
        `Mày chắc chắn muốn xóa đề "${quizName}" không? Thao tác này không thể hoàn tác!`
      )
    ) {
      const result = await deleteQuiz(quizId, adminKey);
      setStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8 text-center">
          <Link to="/" title="Về trang chủ" className="absolute top-0 left-0">
            <img
              src="/home.gif"
              alt="Home Page"
              className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">
            Bảng Điều Khiển Admin
          </h1>
          <p className="text-gray-500">Quản lý và import đề thi trắc nghiệm</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-xl mx-auto">
          <div className="relative mb-4">
            <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Nhập Admin Key để thực hiện các thao tác"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div
            className={`p-3 rounded-lg text-center font-semibold text-sm ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : status.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {status.message}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Import Đề Mới
                </h2>
                <p className="text-gray-500">Tải lên từ file Excel</p>
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
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div className="relative">
                <MessageSquare className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                <textarea
                  placeholder="Mô tả ngắn về đề thi (tùy chọn)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 outline-none transition resize-none"
                />
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

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <ListChecks className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Quản Lý Đề Thi
                </h2>
                <p className="text-gray-500">Tổng cộng: {quizList.length} đề</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {quizList.length > 0 ? (
                quizList.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <span className="font-semibold text-gray-700">
                      {quiz.name}
                    </span>
                    <button
                      onClick={() => handleDelete(quiz.id, quiz.name)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
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
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;
