/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#7e3af2',
        success: '#0e9f6e',
        danger: '#f05252',
        warning: '#c27803'
      }
    },
  },
  plugins: [],
}
