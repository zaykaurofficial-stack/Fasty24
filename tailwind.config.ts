import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fasty: {
          yellow: '#FFC400',
          black: '#0D0D0D',
          white: '#FFFFFF',
          gray: '#6B7280',
          light: '#F9FAFB',
          dark: '#1A1A1A',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(13, 13, 13, 0.06), 0 4px 16px -4px rgba(13, 13, 13, 0.05)',
        lift: '0 12px 32px -12px rgba(13, 13, 13, 0.18), 0 4px 12px -6px rgba(13, 13, 13, 0.08)',
        glow: '0 8px 24px -8px rgba(255, 196, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
