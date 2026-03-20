/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          'bg-root': 'var(--color-bg-root)',
          'bg-surface': 'var(--color-bg-surface)',
          'bg-raised': 'var(--color-bg-raised)',
          'bg-header': 'var(--color-bg-header)',
          'bg-muted': 'var(--color-bg-muted)',
          'bg-input': 'var(--color-bg-input)',
          border: 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          'text-heading': 'var(--color-text-heading)',
          accent: 'var(--color-accent)',
          'accent-muted': 'var(--color-accent-muted)',
          success: 'var(--color-success)',
          'success-muted': 'var(--color-success-muted)',
          danger: 'var(--color-danger)',
          'danger-muted': 'var(--color-danger-muted)',
          warning: 'var(--color-warning)',
          'warning-muted': 'var(--color-warning-muted)',
          bank: 'var(--color-bank)',
          'bank-muted': 'var(--color-bank-muted)',
        },
      },
      fontFamily: {
        'theme-heading': 'var(--font-heading)',
        'theme-body': 'var(--font-body)',
        'theme-mono': 'var(--font-mono)',
      },
      borderRadius: {
        'theme-sm': 'var(--radius-sm)',
        'theme-md': 'var(--radius-md)',
        'theme-lg': 'var(--radius-lg)',
        'theme-xl': 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
};
