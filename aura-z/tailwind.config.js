/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'aura-black': '#050508',
        'aura-dark': '#0a0a12',
        'aura-card': '#0f0f1a',
        'aura-purple': '#a855f7',
        'aura-violet': '#7c3aed',
        'aura-neon': '#c084fc',
        'aura-cyan': '#22d3ee',
        'aura-green': '#34d399',
        'aura-pink': '#f472b6',
        'aura-gold': '#fbbf24',
        'glass-white': 'rgba(255,255,255,0.06)',
        'glass-border': 'rgba(255,255,255,0.1)',
        'glass-hover': 'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #050508 0%, #1a0533 40%, #0d0d2b 70%, #050508 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(124,58,237,0.05) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #a855f7, #7c3aed, #22d3ee)',
        'cta-gradient': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #22d3ee 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(124,58,237,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(124,58,237,0.3)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseNeon: {
          '0%, 100%': { textShadow: '0 0 10px rgba(168,85,247,0.5), 0 0 20px rgba(168,85,247,0.3)' },
          '50%': { textShadow: '0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
