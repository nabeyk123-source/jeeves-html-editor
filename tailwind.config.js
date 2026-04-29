/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        butler: {
          ink: '#1a1a1a',
          smoke: '#2a2a2a',
          paper: '#fafaf7',
          cream: '#f5f1e8',
          gold: '#c8a96a',
          'gold-deep': '#a3864e',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Noto Sans JP"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
