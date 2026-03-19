/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0f172a',
        'brand-accent': '#e8553d',
        'brand-secondary': '#d4a853',
        'brand-bg': '#f5f3f0',
        'brand-surface': '#fafaf8',
        'brand-text': '#1c1917',
        'brand-muted': '#78716c',
        'brand-success': '#16a34a',
        'brand-danger': '#dc2626',
        'brand-border': '#e8e5e0',
        'brand-hover': '#f0ede8',
      },
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
