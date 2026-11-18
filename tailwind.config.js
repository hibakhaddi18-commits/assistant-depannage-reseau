/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f5f0',
          100: '#e3e9df',
          200: '#c8d4c2',
          300: '#a9b99f',
          400: '#8a9b84',
          500: '#74856f',
          600: '#5d6b59',
          700: '#4b5648',
        },
        sand: {
          100: '#f5f0e6',
          200: '#e9e3d8',
          300: '#d8d0bf',
          400: '#c4b99f',
          500: '#b8a88f',
          600: '#9c8c73',
        },
        cocoa: {
          500: '#6b655c',
          600: '#5c564e',
          700: '#4a4640',
        },
        warmgray: {
          400: '#a8a195',
          500: '#8b857a',
        },
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
