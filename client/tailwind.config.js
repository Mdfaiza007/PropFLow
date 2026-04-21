/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aap yahan apne custom colors add kar sakte hain, example:
        primary: '#4F46E5', // Indigo-600
        secondary: '#10B981', // Emerald-500
        dark: '#111827',
        light: '#F3F4F6'
      }
    },
  },
  plugins: [],
}