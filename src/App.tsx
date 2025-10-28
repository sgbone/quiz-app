import { useEffect } from "react";
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

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
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
