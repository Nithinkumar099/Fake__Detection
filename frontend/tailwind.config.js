/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#070A10",
          900: "#0B0F19",
          850: "#0F1626",
          800: "#141D30",
          700: "#1C2842"
        },
        cyber: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          indigo: "#6366F1"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"]
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-emerald": "glowEmerald 2s ease-in-out infinite alternate"
      },
      keyframes: {
        glowEmerald: {
          "0%": { boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(16, 185, 129, 0.5)" }
        }
      }
    }
  },
  plugins: []
};
