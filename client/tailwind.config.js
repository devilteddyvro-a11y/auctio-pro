/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ipl: {
          dark: "#0b0f19",
          card: "#131b2e",
          border: "#1e293b",
          gold: "#f59e0b",
          accent: "#3b82f6"
        }
      }
    },
  },
  plugins: [],
}

