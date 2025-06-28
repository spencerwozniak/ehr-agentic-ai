// tailwind.config.js
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}', // adjust paths based on your project
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [require('@tailwindcss/typography')],
  }
  