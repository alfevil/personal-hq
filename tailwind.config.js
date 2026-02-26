/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onest', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          base: '#080810',
          card: '#0f0f1a',
          hover: '#141424',
          border: '#1e1e30',
        },
        accent: {
          DEFAULT: '#6366f1',
          dim: '#4f46e5',
          glow: 'rgba(99,102,241,0.15)',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#8888a0',
          muted: '#44445a',
        },
        status: {
          green: '#22d3a0',
          yellow: '#fbbf24',
          red: '#f87171',
          blue: '#60a5fa',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
