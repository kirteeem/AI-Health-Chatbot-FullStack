/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      colors: {
        // Requested brand palette
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#818CF8',
        text: '#E2E8F0',
        // CSS-variable based tokens (preferred for theming)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        bg: 'rgb(var(--bg) / <alpha-value>)',
        brand: {
          50: '#eff6ff',
          200: '#9fc6ff',
          400: '#4496ff',
          500: '#1b7bff',
          600: '#0f63d6',
          700: '#124fa7',
        },
      },
      boxShadow: {
        glow: '0 12px 42px rgba(27, 123, 255, 0.28)',
        soft: '0 10px 30px rgba(2, 6, 23, 0.35)',
        softSm: '0 6px 18px rgba(2, 6, 23, 0.28)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
        fadeUp: 'fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}