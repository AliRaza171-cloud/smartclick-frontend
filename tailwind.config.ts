import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "sc-bg": "var(--sc-bg)",
        "sc-surface": "var(--sc-surface)",
        "sc-border": "var(--sc-border)",
        "sc-ink": "var(--sc-ink)",
        "sc-muted": "var(--sc-muted)",
        "sc-faint": "var(--sc-faint)",
        "sc-accent": "var(--sc-accent)",
        "sc-accent-soft": "var(--sc-accent-soft)",
      },
    },
  },
  plugins: [],
};
export default config;
