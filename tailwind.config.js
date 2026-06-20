/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          cyan: '#06b6d4',
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
               'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-blue':   '0 0 28px rgba(59, 130, 246, 0.35)',
        'glow-cyan':   '0 0 28px rgba(6, 182, 212, 0.35)',
        'glow-green':  '0 0 28px rgba(34, 197, 94, 0.35)',
        'glow-purple': '0 0 28px rgba(139, 92, 246, 0.35)',
        'glow-red':    '0 0 28px rgba(239, 68, 68, 0.35)',
        'soft':        '0 10px 30px -12px rgba(0, 0, 0, 0.5), 0 4px 12px -6px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-warm':   'linear-gradient(135deg, #fbbf24 0%, #f87171 100%)',
        'gradient-cool':   'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #34d399 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float':       'float 4s ease-in-out infinite',
        'gradient-pan':'gradient-pan 6s ease infinite',
      },
    },
  },
  plugins: [],
};
