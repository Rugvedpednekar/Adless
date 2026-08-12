import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: {
          DEFAULT: "#121520",
          hover: "#1A1E2E",
          card: "#161926",
          border: "#23283B",
        },
        adless: {
          cyan: "#00F0FF",
          purple: "#8A2BE2",
          pink: "#FF007A",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 240, 255, 0.15)",
        "glow-purple": "0 0 20px rgba(138, 43, 226, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
