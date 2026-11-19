/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#edf7f3',
          100: '#d7efe6',
          200: '#a9dfce',
          300: '#6fcbae',
          400: '#2ec49f',
          500: '#1fa385',
          600: '#17806a',
          700: '#125c4c',
        },
        sand: {
          100: '#f2f6fa',
          200: '#e6edf3',
          300: '#cbd8e4',
          400: '#9fb4c8',
          500: '#7490ab',
          600: '#4e6a87',
        },
        cocoa: {
          500: '#5d7186',
          600: '#3e546c',
          700: '#1e344d',
        },
        warmgray: {
          400: '#9dabb9',
          500: '#75879a',
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
