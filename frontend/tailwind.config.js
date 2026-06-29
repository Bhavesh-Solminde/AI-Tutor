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
          light: '#F6F5F1',
          dark: '#181818'
        },
        sidebar: {
          light: '#F3F4F6',
          dark: '#1C1C1C'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#222222'
        },
        elevated: {
          light: '#FFFFFF',
          dark: '#2A2A2A'
        },
        border: {
          light: '#E5E7EB',
          dark: '#333333'
        },
        cta: {
          DEFAULT: '#3B6BFF',
          hover: '#2952CC'
        },
        'active-sidebar': {
          light: '#EFF6FF',
          dark: '#333333'
        },
        'text-primary': {
          light: '#333333',
          dark: '#F3F4F6'
        },
        'text-muted': {
          light: '#555555',
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
        display: ['"Satoshi"', 'sans-serif'],
        sans: ['"SF Pro"', '-apple-system', 'BlinkMacSystemFont', 'Helvetica', 'Poppins', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
        inter: ['Poppins', 'sans-serif'],
      }
    }
  },
  plugins: []
}
