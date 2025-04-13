import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        base: "12px",
      },
      colors: {
        dark1: '#0a0a0b',
        dark2: '#18181b',
        dark3: '#393940',

      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;