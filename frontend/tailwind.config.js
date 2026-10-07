/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        glow: '0 0 0 4px rgb(59 130 246 / 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        'card-gradient': 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};
