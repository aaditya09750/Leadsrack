/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  darkMode: 'class',
  safelist: [
    { pattern: /^bg-accent-(blue|purple|green|sky|teal|indigo|brand)$/ },
    { pattern: /^text-accent-(blue|purple|green|sky|teal|indigo|brand)$/ },
    { pattern: /^bg-stat-(views|visits|newUsers|activeUsers)$/ },
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--c-bg) / <alpha-value>)',
        sidebar: 'rgb(var(--c-surface) / <alpha-value>)',
        primary: 'rgb(var(--c-fg) / <alpha-value>)',
        secondary: 'rgb(var(--c-fg) / 0.6)',
        muted: 'rgb(var(--c-fg) / 0.4)',
        border: 'var(--c-border-strong)',
        card: 'rgb(var(--c-fg) / 0.05)',
        surface: 'var(--c-surface-card)',
        ink: '#1C1C1C',
        accent: {
          blue: '#A8C5DA',
          purple: '#C6C7F8',
          green: '#BAEDBD',
          sky: '#B1E3FF',
          teal: '#A1E3CB',
          indigo: '#95A4FC',
          brand: '#7094F4',
        },
        stat: {
          views: 'var(--c-stat-views)',
          visits: 'var(--c-stat-visits)',
          newUsers: 'var(--c-stat-newUsers)',
          activeUsers: 'var(--c-stat-activeUsers)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      spacing: {
        '7': '28px',
      },
      borderRadius: {
        lg: '8px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        tooltip: '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
        card: 'var(--c-shadow-card)',
      },
    },
  },
  plugins: [],
};
