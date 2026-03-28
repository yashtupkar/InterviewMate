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
        'custom-accent': '#bef264',
        'custom-muted': '#88888e',
        background: '#09090b',
        surface: '#121214',
        'surface-alt': '#18181b',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'progress': 'progress 1s ease-in-out infinite',
        'music-bar': 'music-bar 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'music-bar': {
          '0%, 100%': { height: '10%' },
          '50%': { height: '100%' },
        },
      },
    },
  },
  plugins: [],
}
