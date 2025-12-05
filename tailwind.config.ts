import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gh-canvas': '#0d1117',
        'gh-subtle': '#161b22',
        'gh-border': '#30363d',
        'gh-text-primary': '#c9d1d9',
        'gh-text-secondary': '#8b949e',
        'gh-green': '#238636',
        'gh-green-hover': '#2ea043',
        'gh-blue': '#58a6ff',
        'gh-orange': '#f78166',
        'gh-btn-bg': '#21262d',
        'gh-btn-hover': '#30363d',
      },
    },
  },
  plugins: [],
}
export default config