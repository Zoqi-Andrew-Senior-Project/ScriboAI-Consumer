/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
      extend: {
        backgroundOpacity: {
          '10': '0.1',
          '20': '0.2',
          '95': '0.95',
         },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }