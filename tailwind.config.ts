import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "gold-light": "#F5E6A9",
        "gold-dark": "#B8960F",
        dark: "#0A0A0A",
        darker: "#050505",
        "dark-card": "#111827",
        accent: "#E11D48",
        surface: "#0F0F0F",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space)", "sans-serif"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
