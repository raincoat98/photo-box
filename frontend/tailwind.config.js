/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        grape: {
          300: '#d0cce0',
          400: '#9e97b0',
          500: '#6e6882',
          700: '#3a3249',
          800: '#251f2e',
          900: '#18141f',
          950: '#0d0a13',
        },
      },
    },
  },
  plugins: [],
};
