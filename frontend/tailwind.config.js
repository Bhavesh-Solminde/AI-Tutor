/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F9FAFB',
          dark: '#000000'
        },
        sidebar: {
          light: '#F3F4F6',
          dark: '#090909'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#121212'
        },
        elevated: {
          light: '#FFFFFF',
          dark: '#1E1E1E'
        },
        border: {
          light: '#E5E7EB',
          dark: '#262626'
        },
        cta: {
          DEFAULT: '#3B6BFF',
          hover: '#2952CC'
        },
        'active-sidebar': {
          light: '#EFF6FF',
          dark: '#222222'
        },
        'text-primary': {
          light: '#1F2937',
          dark: '#F3F4F6'
        },
        'text-muted': {
          light: '#6B7280',
          dark: '#9CA3AF'
        },
        'wrong-answer': {
          light: '#FEF3C7',
          dark: '#2D2A14'
        },
        explanation: {
          light: '#ECFDF5',
          dark: '#1A2414'
        },
        primary: {
          DEFAULT: '#3B6BFF',
          hover: '#2F5AE0'
        },
        accent: {
          DEFAULT: '#3B6BFF'
        },
        mastery: {
          unstarted: '#9CA3AF',
          learning: '#FBBF24',
          mastered: '#10B981'
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],  /* headlines / hero */
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],        /* body / UI text   */
        mono: ['"Geist Mono"', 'monospace'],                /* code / labels    */
      }
    }
  },
  plugins: []
}
