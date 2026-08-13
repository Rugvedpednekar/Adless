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
        background: "#0F0F0F",
        surface: {
          DEFAULT: "#181818",
          hover: "#272727",
          card: "#181818",
          border: "#303030",
        },
        adless: {
          cyan: "#20E3B2",
          purple: "#20E3B2",
          pink: "#20E3B2",
          muted: "#AAAAAA",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-cyan": "0 8px 24px rgba(0, 0, 0, 0.28)",
        "glow-purple": "0 8px 24px rgba(0, 0, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
