/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // BẬT CHẾ ĐỘ DARK
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [{ pattern: /w-\[(0|[1-9]?[0-9]|100)%\]/ }],
};
