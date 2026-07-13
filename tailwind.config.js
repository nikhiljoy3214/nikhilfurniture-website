/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#FDFBF7',  // Ivory
          100: '#FAF4EC', // Cream / Alabaster
          200: '#EFE3D3', // Soft Wood/Beige
          300: '#E0CCB6', // Warm Sand
          400: '#C7A885', // Light Oak
          500: '#A47E53', // Golden Oak
          600: '#845D3A', // Teak
          700: '#5C4033', // Walnut Brown (Primary brand color)
          800: '#3D2314', // Mahogany / Dark Coffee
          900: '#22120B', // Wenge / Deep Espresso
          950: '#140A06', // Charcoal Wood
        },
        gold: {
          50: '#FCF9F0',
          100: '#F6EFD4',
          200: '#ECDFA9',
          300: '#DFC876',
          400: '#CEAF44',
          500: '#B09230',
          600: '#8F7322',
          700: '#6C541B',
          800: '#4A3713',
          900: '#2E220B',
        },
        charcoal: '#151515',
        copper: '#B87333',
        bronze: '#8C6239',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
