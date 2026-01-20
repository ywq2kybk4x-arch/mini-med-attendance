import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7f9',
          100: '#e9edf2',
          200: '#cfd8e3',
          300: '#a9b8c9',
          400: '#73859a',
          500: '#4a5b6e',
          600: '#364556',
          700: '#26323f',
          800: '#1a232c',
          900: '#10161d'
        },
        accent: {
          500: '#2f6fed',
          600: '#2458c7'
        },
        mint: {
          500: '#38c1a3',
          600: '#2f9c86'
        },
        sun: {
          500: '#f6b246'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
