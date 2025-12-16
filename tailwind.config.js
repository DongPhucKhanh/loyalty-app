// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0062ff',       // Xanh dương chủ đạo (giống style bạn thích)
        'primary-dark': '#004ecb',
        secondary: '#f3f4f6',     // Màu nền xám nhẹ
        surface: '#ffffff',       // Màu nền thẻ
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // Bóng đổ siêu nhẹ
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}