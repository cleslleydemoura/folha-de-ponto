/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        afacad: ['"Afacad"', 'sans-serif'],
        worksans: ['"Work Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
