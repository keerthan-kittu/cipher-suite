import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2b8cee",
        "background-light": "#f6f7f8",
        "background-dark": "#0A0E12",
        "surface-dark": "#101922",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(43, 140, 238, 0.1)",
        "glow-md": "0 0 30px rgba(43, 140, 238, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
