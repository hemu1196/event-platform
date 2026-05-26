/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#050508',
          card: 'rgba(13, 13, 22, 0.7)',
          cardLight: 'rgba(23, 23, 37, 0.8)',
          border: 'rgba(255, 255, 255, 0.06)',
          borderHover: 'rgba(139, 92, 246, 0.25)',
          text: '#f3f4f6',
          muted: '#9ca3af',
          dim: '#6b7280'
        },
        primary: {
          light: '#a78bfa',
          DEFAULT: '#8b5cf6', // Premium Violet
          hover: '#7c3aed',
          dark: '#6d28d9'
        },
        accent: {
          cyan: '#06b6d4',
          cyanHover: '#0891b2',
          pink: '#ec4899',
          purple: '#d946ef',
          emerald: '#10b981'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #050508 0%, #0c0822 50%, #050508 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(40px)' },
          '50%': { opacity: '0.8', filter: 'blur(60px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
