/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Isso diz: "Procure em todos os arquivos dentro de src"
  ],
  theme: {
    extend: {
      colors: {
        'yami-dark': '#1a1a1d',
        'yami-gray': '#2d2d30',
        'kawaii-pink': '#ff7eb6',
        'kawaii-purple': '#be93fd',
        'kawaii-cyan': '#7ee7f0',
        'medical-red': '#ff5c5c',
      },
      fontFamily: {
        'pixel': ['monospace'], // Improviso enquanto não baixamos a fonte pixel real
        'body': ['sans-serif'],
      }
    },
  },
  plugins: [],
}