import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import ThemeToggle from "./ThemeToggle";
import Notifications from "./Notifications";

export default function Navbar() {
  const { session, profile } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent backdrop-blur-sm z-40 border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to={session ? "/" : "/"}
              className="flex items-center gap-2 group"
            >
              <img
                src="/DoanhNhanFPTU.png"
                alt="Logo"
                className="h-8 w-auto group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-xl text-white"></span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <>
                <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <Notifications />
                </div>
                <Link to="/profile">
                  <img
                    src={
                      profile?.avatar_url ||
                      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username}`
                    }
                    alt="User Avatar"
                    className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 hover:ring-2 ring-offset-2 ring-offset-gray-900 ring-indigo-500 transition"
                  />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-md hover:bg-white/20 border border-white/20 transition"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
