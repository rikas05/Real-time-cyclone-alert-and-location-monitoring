/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7B68EE',
        emergency: '#FF4500',
        info: '#87CEEB',
      },
    },
  },
  plugins: [],
};