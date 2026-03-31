/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        "background-dark": "#0f0f10",

        surface: "#f6f6f7",
        "surface-dark": "#18181b",

        surfaceAlt: "#ececef",
        "surfaceAlt-dark": "#232326",

        chrome: "#ffffff",
        "chrome-dark": "#000000",

        border: "#d4d4d8",
        "border-dark": "#2f2f35",

        text: "#111113",
        "text-dark": "#f5f5f5",

        textMuted: "#6b7280",
        "textMuted-dark": "#a1a1aa",

        primary: "#ff4b8c",
        "primary-dark": "#ff6fa1",

        success: "#22c55e",
        warning: "#facc15",
        error: "#ef4444",
      },
      fontSize: {
        "ds-header": ["30px", { lineHeight: "36px", fontWeight: "800" }],
        "ds-subheader": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "ds-body": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "ds-caption": ["12px", { lineHeight: "16px", fontWeight: "600" }],
      },
      borderRadius: {
        "ds-card": "16px",
        "ds-control": "12px",
        "ds-tag": "8px",
      },
    },
  },
  plugins: [],
};
