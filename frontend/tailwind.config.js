/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD700',
          red: '#FF3B3B',
          white: '#FFFFFF',
          dark: '#222222',
        },
        background: {
          light: '#FFFFFF',
          dark: '#111827', // Tailwind Gray-900 for dark mode background
        },
        surface: {
          light: '#F3F4F6', // Tailwind Gray-100
          dark: '#1F2937', // Tailwind Gray-800
        },
        text: {
          light: '#222222',
          dark: '#FFFFFF',
          muted: {
            light: '#6B7280', // Gray-500
            dark: '#9CA3AF', // Gray-400
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
