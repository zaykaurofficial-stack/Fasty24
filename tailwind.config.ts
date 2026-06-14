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
    },
  },
  plugins: [],
};

export default config;
