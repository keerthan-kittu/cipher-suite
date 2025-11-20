import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00B2A9",
        gold: {
          DEFAULT: "#00B2A9",
          light: "#00D4C8",
          dark: "#008F88",
        },
        "background-dark": "#000000",
        "surface-dark": "#0A0A0A",
        "surface-elevated": "#141414",
        severity: {
          critical: "#DC2626",
          high: "#F97316",
          medium: "#EAB308",
          low: "#00B2A9",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(37, 99, 235, 0.2)",
        "glow-md": "0 0 30px rgba(37, 99, 235, 0.3)",
        "glow-lg": "0 0 45px rgba(37, 99, 235, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
