/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/nativewind/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        base: {
          100: "#1b1b1b",
          200: "#1b1b1b",
          300: "#2d2d2d",
          content: "#fefbee",
        },
        primary: "#ff4b8c",
        "primary-content": "#ffffff",
        secondary: "#f7c548",
        "secondary-content": "#002d40",
        accent: "#00c2cb",
        "accent-content": "#ffffff",
        neutral: "#3b3b3b",
        "neutral-content": "#fefbee",
        gray: "#57534e",
        "gray-content": "#fefbee",
        info: "#38bdf8",
        "info-content": "#002d40",
        success: "#22c55e",
        "success-content": "#002d40",
        warning: "#facc15",
        "warning-content": "#002d40",
        error: "#e50006",
        "error-content": "#ffffff",
      },
      borderRadius: {
        selector: "0.5rem",
        field: "0.25rem",
        box: "0.5rem",
      },
      spacing: {
        selector: "0.25rem",
        field: "0.25rem",
      },
    },
  },
  plugins: [],
};
