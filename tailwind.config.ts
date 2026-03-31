import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        abyss: {
          950: "#020817",
          900: "#030d1f",
          800: "#041026",
        },
        cyan: {
          glow: "rgba(34,211,238,0.6)",
        },
      },
      animation: {
        "scan": "scan 3s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "flicker": "flicker 0.15s infinite linear",
        "float": "float 6s ease-in-out infinite",
        "matrix-rain": "matrixRain 20s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "border-flow": "borderFlow 4s linear infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(34,211,238,0.6), 0 0 80px rgba(34,211,238,0.3)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backgroundImage: {
        "grid-cyan": "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.08) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "60px 60px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
