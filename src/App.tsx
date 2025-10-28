import { useEffect } from "react"; // Nhớ import useEffect
import { Routes, Route, useLocation } from "react-router-dom";
import { useAppStore } from "./store/quizStore";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import AdminPage from "./pages/AdminPage";
import Footer from "./components/Footer";
import { AnimatePresence } from "framer-motion";

function App() {
  const location = useLocation();
  const theme = useAppStore((state) => state.theme);

  // PHẦN LOGIC QUAN TRỌNG NHẤT NẰM Ở ĐÂY
  useEffect(() => {
    const root = window.document.documentElement; // Đây là thẻ <html>
    // Xóa class cũ (nếu có)
    root.classList.remove(theme === "light" ? "dark" : "light");
    // Thêm class mới
    root.classList.add(theme);
  }, [theme]); // Chạy lại mỗi khi state `theme` thay đổi

  return (
    // Bỏ class `theme` ở đây đi, vì ta đã quản lý nó ở thẻ <html> rồi
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
