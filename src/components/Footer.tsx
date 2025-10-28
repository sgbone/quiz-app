import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 bg-opacity-30 backdrop-blur-sm text-white py-4 px-4 sm:px-8 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Phần bên trái */}
        <p className="text-xs sm:text-sm text-gray-300">
          Doanh Nhan FU 0.10 Copyright &copy; 2025
        </p>

        {/* Phần bên phải */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/admin" title="Đi tới trang Admin">
            <img
              src="/admin.gif"
              alt="Admin Page"
              className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </Link>
          <a
            href="https://discord.gg/PXdAXnyUDR"
            target="_blank"
            rel="noopener noreferrer"
            title="Tham gia Discord"
          >
            <img
              src="/discord.webp"
              alt="Discord Server"
              className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
