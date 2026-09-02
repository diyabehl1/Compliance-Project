/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        graphite: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          850: "#1f1f23",
          900: "#18181b",
          950: "#0f0f11",
        },
      },
      backgroundImage: {
        "mist-light": "linear-gradient(145deg, #fafafa 0%, #f0f0f3 35%, #e4e4e7 70%, #d4d4d8 100%)",
        "mist-dark":
          "linear-gradient(145deg, #0f0f11 0%, #18181b 25%, #27272a 55%, #3f3f46 85%, #52525b 100%)",
        "glass-shine": "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
        "glass-dark": "0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        glow: "0 0 40px rgba(139, 92, 246, 0.15)",
      },
    },
  },
  plugins: [],
};
