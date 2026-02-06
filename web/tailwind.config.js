/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        "parchment": "#F3E9D2",
        "parchment-dark": "#E6D6B8",
        "ink": "#2C241B",
        "ink-light": "#5D4E3F",
        "cinnabar": "#A83232",
        "cinnabar-dim": "#8A2525",
        "imperial-gold": "#D4AF37",
        "jade": "#4A7C59",
        "paper-border": "#D1C2A3",
      },
      fontFamily: {
        "serif": ["Noto Serif SC", "serif"],
        "sans": ["Noto Sans SC", "sans-serif"],
        "brush": ["Ma Shan Zheng", "cursive"],
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'lantern': '0 4px 20px -5px rgba(168, 50, 50, 0.6)',
        'lantern-glow': '0 0 30px 8px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
}
