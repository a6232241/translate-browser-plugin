/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tp-",
  important: true,
  corePlugins: {
    preflight: false
  },
  content: [
    "./src/**/*.{ts,tsx}",
    "./*.tsx",
    "./contents/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a"
        }
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "slide-in-bottom": "slideInBottom 0.3s ease-out",
        spin: "spin 1s linear infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        slideInBottom: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" }
        }
      },
      boxShadow: {
        dot: "0 4px 12px rgba(59, 130, 246, 0.4)",
        "dot-hover": "0 4px 12px rgba(59, 130, 246, 0.6), 0 0 0 2px rgba(59, 130, 246, 0.4)",
        "drawer-right": "-4px 0 24px rgba(0, 0, 0, 0.08)",
        "drawer-left": "4px 0 24px rgba(0, 0, 0, 0.08)",
        "drawer-bottom": "0 -4px 24px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
}
