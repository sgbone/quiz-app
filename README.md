# 🚀 Chữa Đề Trắc Nghiệm - DoanhNhanFU 0.10

Một ứng dụng ôn tập trắc nghiệm hiện đại, cho phép người dùng import đề thi từ file Excel, luyện tập với giao diện chuyên nghiệp và quản lý đề thi một cách dễ dàng.

## ✨ Tính Năng Nổi Bật

- **📤 Import Đề Từ Excel:** Dễ dàng tạo và quản lý hàng trăm câu hỏi chỉ với một file Excel theo format đơn giản.
- **📚 Quản Lý Đề Thi:** Giao diện Admin cho phép thêm (kèm mô tả), xem danh sách và xóa các đề thi.
- **🔐 Bảo Mật Admin:** Trang quản trị được bảo vệ bằng Admin Key lưu trong biến môi trường.
- **💅 Giao Diện Hiện Đại:**
  - Thiết kế responsive, tối ưu cho cả desktop và mobile.
  - Hiệu ứng viền LED RGB "chất chơi" cho danh sách đề.
  - Hiệu ứng chuyển trang, chuyển câu hỏi mượt mà với Framer Motion.
  - Hiệu ứng hoa rơi (snowflakes) làm nền thư giãn.
- **☀️/🌙 Chế Độ Sáng/Tối:** Tự động lưu lựa chọn của người dùng vào trình duyệt.
- **⌨️ Hỗ Trợ Phím Tắt:** Thao tác nhanh hơn với hệ thống phím tắt tiện lợi (chọn đáp án, chuyển câu, mở bảng phím tắt...).
- **🗺️ Bản Đồ Câu Hỏi:** Dễ dàng theo dõi tiến độ và nhảy đến bất kỳ câu hỏi nào.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend (Mock API):** [My JSON Server](https://my-json-server.typicode.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Bắt Đầu Nhanh

### 1. Điều kiện cần

- [Node.js](https://nodejs.org/) (phiên bản 16.x trở lên)
- Một tài khoản GitHub

### 2. Cài Đặt Phía Backend (Mock API)

1.  Tạo một kho chứa (repository) **public** mới trên GitHub (ví dụ: `quiz-app-db`).
2.  Tạo một file `db.json` trong kho chứa đó với nội dung:
    ```json
    {
      "quizzes": []
    }
    ```
3.  Địa chỉ API của bạn sẽ là `https://my-json-server.typicode.com/[Tên-GitHub]/[Tên-repo]`.

### 3. Cài Đặt Phía Frontend

1.  Clone kho chứa này về máy:
    ```bash
    git clone https://github.com/[Tên-GitHub-của-mày]/[Tên-repo-code-react].git
    ```
2.  Di chuyển vào thư mục project:
    ```bash
    cd [Tên-repo-code-react]
    ```
3.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
4.  Tạo file `.env.local` ở thư mục gốc và thêm các biến môi trường:

    ```
    # Thay bằng địa chỉ API bạn đã tạo ở trên
    VITE_API_URL=https://my-json-server.typicode.com/[Tên-GitHub]/[Tên-repo-db]

    # Đặt mật khẩu admin của bạn
    VITE_ADMIN_KEY= mật-khẩu-siêu-bí-mật
    ```

    _Lưu ý: Bạn cần sửa lại `API_URL` trong file `src/store/quizStore.ts` để trỏ đúng vào biến môi trường này._

5.  Chạy project ở chế độ development:
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập `http://localhost:5173`.

## 🚢 Deploy Lên Vercel

Dự án này được tối ưu để deploy trên Vercel một cách dễ dàng:

1.  Push code của bạn lên một kho chứa GitHub.
2.  Import kho chứa đó vào Vercel.
3.  Thêm các biến môi trường (`VITE_API_URL`, `VITE_ADMIN_KEY`) trong phần cài đặt của project trên Vercel.
4.  Bấm **Deploy** và tận hưởng thành quả!

## ©️ Copyright

Copyright © 2025 Doanh Nhan FU 0.10.
