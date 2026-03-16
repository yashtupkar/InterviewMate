/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#bef264',
          hover: '#a3e635',
          glow: 'rgba(190, 242, 100, 0.2)',
        },
        background: '#09090b',
        surface: '#121214',
        'surface-alt': '#18181b',
      }
    },
  },
  plugins: [],
}
