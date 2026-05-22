/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  future: {
    // Only apply hover styles on devices that support hovering (not touch-primary).
    // Fixes incorrect hover states on mobile which can cause CLS.
    hoverOnlyWhenSupported: true,
  },
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
          dark: '#111827',
        },
        surface: {
          light: '#F3F4F6',
          dark: '#1F2937',
        },
        text: {
          light: '#222222',
          dark: '#FFFFFF',
          muted: {
            light: '#6B7280',
            dark: '#9CA3AF',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        // Used by CategoryCarousel and TrustSection for CSS staggered reveals
        'fade-slide-up': 'fadeSlideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionProperty: {
        // Explicit narrow transition sets — used to replace broad `transition` class
        // which recalculates ALL CSS properties and inflates style computation time.
        'transform-shadow': 'transform, box-shadow',
        'border-transform': 'border-color, transform',
      },
    },
  },
  // Safelist dynamic classes used in JS (e.g. animation-delay inline styles)
  safelist: [
    'animate-[fadeSlideUp_0.5s_ease_forwards]',
    'cv-auto',
  ],
  plugins: [],
};
