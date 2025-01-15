/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', [
    '@media (prefers-color-scheme: dark) { &:not(.light *) }',
    '&:is(.dark *)',
  ]],
  content: [
    "./index.html",
    "./src/**/*.{js,css}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
