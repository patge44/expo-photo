import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          // Chaque nuance lit une variable CSS (triplet RGB) définie
          // dans globals.css (défaut) puis surchargée par club dans layout.
          50: "rgb(var(--c-primary-50) / <alpha-value>)",
          100: "rgb(var(--c-primary-100) / <alpha-value>)",
          200: "rgb(var(--c-primary-200) / <alpha-value>)",
          300: "rgb(var(--c-primary-300) / <alpha-value>)",
          400: "rgb(var(--c-primary-400) / <alpha-value>)",
          500: "rgb(var(--c-primary-500) / <alpha-value>)",
          600: "rgb(var(--c-primary-600) / <alpha-value>)",
          700: "rgb(var(--c-primary-700) / <alpha-value>)",
          800: "rgb(var(--c-primary-800) / <alpha-value>)",
          900: "rgb(var(--c-primary-900) / <alpha-value>)",
          950: "rgb(var(--c-primary-950) / <alpha-value>)",
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;