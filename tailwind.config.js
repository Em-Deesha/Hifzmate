/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        islamic: {
          green: '#1a4d2e',
          'green-light': '#2d5a3d',
          'green-lighter': '#4a7c59',
          gold: '#d4af37',
          'gold-light': '#f4d03f',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

