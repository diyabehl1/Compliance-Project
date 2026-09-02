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
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce0ff",
          300: "#8ecaff",
          400: "#59adff",
          500: "#318dff",
          600: "#1a6ef5",
          700: "#1458e1",
          800: "#1647b6",
          900: "#183f8f",
        },
        ink: {
          950: "#030712",
          900: "#0a0f1e",
          850: "#0c1224",
          800: "#101828",
          700: "#151f35",
          600: "#1a2744",
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
          900: "#18181b",
          950: "#0f0f11",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
        "glass-dark": "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(59,130,246,0.08)",
        glow: "0 0 48px rgba(49, 141, 255, 0.2)",
      },
    },
  },
  plugins: [],
};
