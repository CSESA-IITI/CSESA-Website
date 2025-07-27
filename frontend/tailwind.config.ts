import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purpleBlue: "#8A2BE2",
        "custom-purple": "rgba(24, 21, 40, 0.85)",
      },
      boxShadow: {
        'dissolved': '0px 15px 35px -5px rgba(59, 130, 246, 0.4), 0px 5px 15px -5px rgba(0, 0, 0, 0.1)',
        // You can create variants for different colors
        'dissolved-pink': '0px 15px 35px -5px rgba(236, 72, 153, 0.4), 0px 5px 15px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
