import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAppStore } from "./store/quizStore";
import { useAuthStore } from "./store/authStore"; // Import auth store
import { supabase } from "./supabaseClient"; // Import supabase client

// Import tất cả các trang
import DiscordCallback from "./pages/DiscordCallback";
import WelcomePage from "./pages/WelcomePage";
import SelectExamPage from "./pages/SelectExamPage";
import QuizPage from "./pages/QuizPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
// Import trang Profile mới
import DocsPage from "./pages/DocsPage";
import ProjectPage from "./pages/ProjectPage";
import UploadProjectPage from "./pages/UploadProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import EditProjectPage from "./pages/EditProjectPage";
// Import các component layout chung
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import { AnimatePresence } from "framer-motion";

function App() {
  const location = useLocation();
  const theme = useAppStore((state) => state.theme);
  const { setSession, fetchProfile } = useAuthStore();

  // "Lắng nghe" sự thay đổi trạng thái đăng nhập của Supabase
  useEffect(() => {
    // Lấy session hiện tại khi tải trang lần đầu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile();
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchProfile();
        } else {
          // Đảm bảo profile bị xóa khi logout
          useAuthStore.setState({ profile: null });
        }
      }
    );

    // Hủy lắng nghe khi component bị unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setSession, fetchProfile]);

  // Áp dụng theme (sáng/tối)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
  }, [theme]);

  // Xác định các trang không hiển thị Navbar/Footer
  const hideLayout = ["/login", "/signup", "/", "/admin"].includes(
    location.pathname
  );
  const showFooter = ["/select-exam"].includes(location.pathname);

  return (
    <div
      className={`min-h-screen flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${
        hideLayout
          ? "bg-gray-100 dark:bg-gray-900"
          : "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
      }`}
    >
      {!hideLayout && <Navbar />}

      {/* Thêm padding top để nội dung không bị Navbar che */}
      <main className={`flex-grow ${!hideLayout ? "pt-16" : ""}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* GỠ BỎ `Route` BỌC NGOÀI */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/select-exam" element={<SelectExamPage />} />\
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/project" element={<ProjectPage />} />
            <Route path="/project/upload" element={<UploadProjectPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
            <Route path="/project/edit/:id" element={<EditProjectPage />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/discord/callback" element={<DiscordCallback />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideLayout && showFooter && <Footer />}
    </div>
  );
}

export default App;
