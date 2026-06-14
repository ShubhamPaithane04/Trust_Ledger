/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#050A15',
          dark: '#0A1225',
          blue: '#1A365D',
          neon: '#00F0FF',
          purple: '#8A2BE2',
          red: '#FF003C',
          green: '#00FF66',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
