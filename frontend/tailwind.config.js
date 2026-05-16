/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        brand: {
          900: "#0A1628",
          800: "#0D1F3C",
          700: "#102B54",
          600: "#1A3F73",
          500: "#1E4D8C",
          400: "#2563EB",
          300: "#4F8FF5",
          200: "#93C5FD",
          100: "#DBEAFE",
          50: "#EFF6FF",
        },
        accent: {
          900: "#312E81",
          800: "#3730A3",
          700: "#4338CA",
          600: "#4F46E5",
          500: "#6366F1",
          400: "#818CF8",
          300: "#A5B4FC",
          200: "#C7D2FE",
          100: "#E0E7FF",
          50: "#EEF2FF",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 1px rgba(15, 23, 42, 0.03)",
        md: "0 4px 6px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.03)",
        lg: "0 10px 15px rgba(15, 23, 42, 0.07), 0 4px 6px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        xl: "0 20px 25px rgba(15, 23, 42, 0.08), 0 10px 10px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        focus: "0 0 0 3px rgba(99, 102, 241, 0.3), 0 0 0 1px #6366F1",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "100% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.4" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        fadeIn: "fadeIn 200ms var(--ease-smooth, ease-out) forwards",
        slideUp: "slideUp 220ms var(--ease-decel, ease-out) forwards",
        slideInRight: "slideInRight 220ms var(--ease-decel, ease-out) forwards",
        bounceIn: "bounceIn 260ms var(--ease-spring, ease-out) forwards",
        pulseDot: "pulseDot 1.5s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        decel: "cubic-bezier(0, 0, 0.2, 1)",
        accel: "cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [],
};

