import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purpleBlue: '#8A2BE2',
        'custom-purple': 'rgba(24, 21, 40, 0.85)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
