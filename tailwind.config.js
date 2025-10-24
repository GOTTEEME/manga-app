/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E85D2C',
          light: '#FF8A5B',
        },
        secondary: {
          DEFAULT: '#004E89',
          light: '#1A659E',
          dark: '#003459',
        },
        accent: '#1A659E',
        text: {
          primary: '#1D3557',
          secondary: '#6C757D',
        },
        bg: {
          light: '#F8F9FA',
          DEFAULT: '#FFFFFF',
        },
        border: '#E9ECEF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 20px rgba(0,0,0,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
