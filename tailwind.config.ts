import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:      ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif:     ['var(--font-serif)', 'Georgia', 'serif'],
        'serif-2': ['var(--font-serif-2)', 'Georgia', 'serif'],
      },
      colors: {
        navy: { 900: '#0f2341', 800: '#173258', 700: '#1f406e' },
        gold: '#b3894c',
        ink:  '#0c1626',
      },
    },
  },
  plugins: [typography],
};
export default config;
