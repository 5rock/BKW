/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          obsidian: 'var(--color-obsidian)',
          graphite: 'var(--color-graphite)',
          gold: 'var(--color-gold)',
          champagne: 'var(--color-champagne)',
          ivory: 'var(--color-ivory)',
          white: 'var(--color-white)',
        },
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          border: 'var(--surface-border)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        instrument: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-slide-up': 'fadeSlideUp 0.5s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
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
        'transform-shadow': 'transform, box-shadow',
        'border-transform': 'border-color, transform',
        'colors-shadow': 'background-color, border-color, color, fill, stroke, box-shadow',
      },
    },
  },
  safelist: [
    'animate-[fadeSlideUp_0.5s_ease_forwards]',
    'cv-auto',
  ],
  plugins: [],
};
