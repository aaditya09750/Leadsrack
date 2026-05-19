/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1C1C1C',
        sidebar: '#1C1C1C',
        card: 'rgba(255, 255, 255, 0.05)',
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.4)',
        muted: 'rgba(255, 255, 255, 0.2)',
        border: 'rgba(255, 255, 255, 0.1)',
        accent: {
          blue: '#A8C5DA',
          purple: '#C6C7F8',
          green: '#BAEDBD',
          sky: '#B1E3FF',
          teal: '#A1E3CB',
          indigo: '#95A4FC',
          brand: '#7094F4'
        },
        stat: {
          views: '#E3F5FF',
          visits: '#E5ECF6',
          newUsers: '#E3F5FF',
          activeUsers: '#E5ECF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '7': '28px', // Matching Figma's 28px grid
      },
      borderRadius: {
        'lg': '8px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'tooltip': '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
