import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cos: {
          ink: "#060A12",
          navy: "#07111F",
          panel: "#0D1726",
          panel2: "#121E2E",
          line: "#213044",
          text: "#F4F7FB",
          muted: "#8EA0B8",
          teal: "#42C7B7",
          tealSoft: "#193A3B",
          amber: "#D6A84F",
          red: "#D96363",
          green: "#73C994",
          blue: "#6FA8DC"
        }
      },
      boxShadow: {
        operational: "0 18px 45px rgba(0, 0, 0, 0.28)",
        drawer: "0 -18px 45px rgba(0, 0, 0, 0.42)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
