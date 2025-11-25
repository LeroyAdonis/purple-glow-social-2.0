/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': '#05040A',
        'neon-grape': '#9D4EDD',
        'joburg-teal': '#00E0FF',
        'mzansi-gold': '#FFCC00',
        'hyper-crimson': '#FF2A6D',
        'pretoria-blue': '#1A1F3A',
        'electric-indigo': '#5A189A',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'display': ['Syne', 'sans-serif'],
        'body': ['Outfit', 'sans-serif'],
        'mono': ['Space Grotesk', 'monospace'],
      },
    },
  },
  plugins: [],
}
