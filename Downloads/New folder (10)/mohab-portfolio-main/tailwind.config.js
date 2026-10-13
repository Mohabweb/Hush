/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#050505',
          50: '#0a0a0a',
          100: '#111111',
          200: '#1a1a1a',
          300: '#222222',
          400: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          glow: '#3b82f6',
        },
        muted: '#8a8a8a',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'tighter-custom': '-0.05em',
        'tight-custom': '-0.03em',
      },
      animation: {
        'scroll-line': 'scrollLine 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        scrollLine: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(24px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
