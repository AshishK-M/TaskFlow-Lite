import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bcd4ff',
          300: '#8ab5ff',
          400: '#578eff',
          500: '#3169ff',
          600: '#1f4af0',
          700: '#1a3bd1',
          800: '#1a32a8',
          900: '#1c3084',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
