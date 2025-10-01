/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
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
        // Project Hyper Pink Color Scheme
        primary: {
          DEFAULT: "#ff4b8c", // Vibrant fitness pink
          content: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f7c548", // Sunny gold
          content: "#002d40",
        },
        accent: {
          DEFAULT: "#00c2cb", // Aqua
          content: "#ffffff",
        },
        base: {
          100: "#1a1a1a", // Dark background
          200: "#262626", // Dark surface
          300: "#333333", // Card/Panel background
          content: "#fefbee", // Creamy text
        },
        neutral: {
          DEFAULT: "#3b3b3b",
          content: "#fefbee",
        },
        info: {
          DEFAULT: "#38bdf8",
          content: "#002d40",
        },
        success: {
          DEFAULT: "#22c55e",
          content: "#002d40",
        },
        warning: {
          DEFAULT: "#facc15",
          content: "#002d40",
        },
        error: {
          DEFAULT: "#ef4444",
          content: "#ffffff",
        },
        muted: {
          DEFAULT: "#9ca3af",
          content: "#1b1b1b",
        },
      },
      spacing: {
        0.5: "2px",
        1: "4px",
        1.5: "6px",
        2: "8px",
        2.5: "10px",
        3: "12px",
        3.5: "14px",
        4: "16px",
        5: "20px",
        6: "24px",
        7: "28px",
        8: "32px",
        9: "36px",
        10: "40px",
        11: "44px",
        12: "48px",
        14: "56px",
        16: "64px",
        20: "80px",
        24: "96px",
        28: "112px",
        32: "128px",
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
