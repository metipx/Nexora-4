/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── New Nexora Palette ─────────────────────────────
        void:    '#0B1020',
        surface: '#141B2D',
        card:    '#1C2640',
        violet:  {
          DEFAULT: '#7C5CFC',
          light:   '#9B81FF',
          dark:    '#5E3DE8',
          dim:     'rgba(124,92,252,0.08)',
          low:     'rgba(124,92,252,0.12)',
          mid:     'rgba(124,92,252,0.22)',
          glow:    'rgba(124,92,252,0.35)',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          light:   '#33DEFF',
          dark:    '#00A8CC',
          dim:     'rgba(0,212,255,0.08)',
          low:     'rgba(0,212,255,0.12)',
          mid:     'rgba(0,212,255,0.22)',
          glow:    'rgba(0,212,255,0.35)',
        },
        amber: {
          DEFAULT: '#FFB84D',
          light:   '#FFD080',
          dark:    '#E8960A',
          dim:     'rgba(255,184,77,0.08)',
          low:     'rgba(255,184,77,0.12)',
          mid:     'rgba(255,184,77,0.22)',
          glow:    'rgba(255,184,77,0.35)',
        },
        emerald: {
          DEFAULT: '#00C896',
          light:   '#33E8B8',
          dark:    '#009E78',
          dim:     'rgba(0,200,150,0.08)',
          low:     'rgba(0,200,150,0.12)',
          mid:     'rgba(0,200,150,0.22)',
          glow:    'rgba(0,200,150,0.35)',
        },
        frost: {
          DEFAULT: '#E6EDF7',
          muted:   'rgba(230,237,247,0.55)',
          dim:     'rgba(230,237,247,0.35)',
          faint:   'rgba(230,237,247,0.15)',
          ghost:   'rgba(230,237,247,0.07)',
        },

        // ── Legacy aliases (keep for game pages) ──────────
        accent: {
          DEFAULT: '#7C5CFC',
          200:     '#9B81FF',
          300:     '#7C5CFC',
          glow:    'rgba(124,92,252,0.35)',
        },
        ink: {
          DEFAULT: '#E6EDF7',
          50:      '#F5F8FC',
          100:     '#E6EDF7',
          200:     '#C9D8EC',
          300:     '#9BB0CC',
          muted:   'rgba(230,237,247,0.55)',
          dim:     'rgba(230,237,247,0.35)',
        },
        ember:   '#FFB84D',

        // ── Semantic ──────────────────────────────────────
        success:  '#00C896',
        warning:  '#FFB84D',
        error:    '#FF5A5A',
        info:     '#00D4FF',

        // ── Rank tiers ────────────────────────────────────
        rank: {
          bronze:   '#CD7F32',
          silver:   '#A0A9BA',
          gold:     '#FFB84D',
          platinum: '#8FCDDD',
          diamond:  '#B9F2FF',
          nexora:   '#9B81FF',
        },
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        title: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        stat:  ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
        'xs':  ['0.75rem',   { lineHeight: '1rem' }],
        'sm':  ['0.875rem',  { lineHeight: '1.375rem' }],
        'base':['1rem',      { lineHeight: '1.625rem' }],
        'lg':  ['1.125rem',  { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',   { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',    { lineHeight: '1.85rem' }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',   { lineHeight: '2.65rem' }],
        '5xl': ['3rem',      { lineHeight: '1.15' }],
        '6xl': ['3.75rem',   { lineHeight: '1.1' }],
        '7xl': ['4.5rem',    { lineHeight: '1.05' }],
        'stat-sm':  ['1.25rem',  { lineHeight: '1', fontWeight: '700' }],
        'stat-md':  ['1.75rem',  { lineHeight: '1', fontWeight: '700' }],
        'stat-lg':  ['2.5rem',   { lineHeight: '1', fontWeight: '800' }],
        'stat-xl':  ['3.5rem',   { lineHeight: '1', fontWeight: '800' }],
      },

      fontWeight: {
        thin:       '100',
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
      },

      spacing: {
        // 8px base grid
        '0.5': '4px',
        '1':   '8px',
        '1.5': '12px',
        '2':   '16px',
        '2.5': '20px',
        '3':   '24px',
        '4':   '32px',
        '5':   '40px',
        '6':   '48px',
        '7':   '56px',
        '8':   '64px',
        '9':   '72px',
        '10':  '80px',
        '12':  '96px',
        '14':  '112px',
        '16':  '128px',
        '18':  '144px',
        '20':  '160px',
        '24':  '192px',
        '28':  '224px',
        '32':  '256px',
      },

      borderRadius: {
        'none': '0',
        'sm':   '4px',
        'md':   '8px',
        'lg':   '12px',
        'xl':   '16px',
        '2xl':  '20px',
        '3xl':  '24px',
        '4xl':  '32px',
        'full': '9999px',
        'card': '16px',
        'badge':'8px',
        'pill': '9999px',
      },

      boxShadow: {
        'none':     'none',
        'xs':       '0 1px 2px rgba(0,0,0,0.4)',
        'sm':       '0 2px 6px rgba(0,0,0,0.5)',
        'md':       '0 4px 12px rgba(0,0,0,0.5)',
        'lg':       '0 8px 24px rgba(0,0,0,0.6)',
        'xl':       '0 16px 40px rgba(0,0,0,0.7)',
        '2xl':      '0 24px 60px rgba(0,0,0,0.8)',

        // Glow shadows
        'glow-accent':  '0 0 20px rgba(124,92,252,0.5), 0 0 50px rgba(124,92,252,0.2)',
        'glow-ember':   '0 0 20px rgba(255,184,77,0.5), 0 0 50px rgba(255,184,77,0.2)',
        'glow-ink':     '0 0 12px rgba(230,237,247,0.3)',
        'glow-gold':    '0 0 16px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.2)',
        'glow-diamond': '0 0 16px rgba(185,242,255,0.5), 0 0 40px rgba(185,242,255,0.2)',

        // Card elevations
        'card':         '0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.05)',
        'card-hover':   '0 8px 36px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.07)',
        'card-active':  '0 2px 8px rgba(0,0,0,0.4)',

        // Inner glow / pressed
        'inner-accent': 'inset 0 1px 0 rgba(124,92,252,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'inner-ember':  'inset 0 1px 0 rgba(255,184,77,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
      },

      backgroundImage: {
        'void-gradient':    'linear-gradient(135deg, #0B1020 0%, #141B2D 100%)',
        'surface-gradient': 'linear-gradient(135deg, #1C2640 0%, #141B2D 50%, #0B1020 100%)',
        'violet-gradient':  'linear-gradient(135deg, #9B81FF 0%, #7C5CFC 50%, #5E3DE8 100%)',
        'cyan-gradient':    'linear-gradient(135deg, #33DEFF 0%, #00D4FF 50%, #00A8CC 100%)',
        'amber-gradient':   'linear-gradient(135deg, #FFD080 0%, #FFB84D 50%, #E8960A 100%)',
        'nexora-hero':      'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(124,92,252,0.22) 0%, transparent 65%), radial-gradient(ellipse 45% 35% at 85% 65%, rgba(0,212,255,0.08) 0%, transparent 55%), linear-gradient(180deg, #0B1020 0%, #0B1020 100%)',
        'card-surface':     'linear-gradient(145deg, rgba(28,38,64,0.9) 0%, rgba(20,27,45,0.95) 100%)',
        'card-violet':      'linear-gradient(145deg, rgba(124,92,252,0.12) 0%, rgba(28,38,64,0.95) 60%, rgba(11,16,32,0.98) 100%)',
        'xp-bar':           'linear-gradient(90deg, #5E3DE8 0%, #7C5CFC 55%, #9B81FF 100%)',
        'rank-bronze':   'linear-gradient(135deg, #CD7F32, #8B5523)',
        'rank-silver':   'linear-gradient(135deg, #C8D4E0, #8A98B0)',
        'rank-gold':     'linear-gradient(135deg, #FFD080, #FFB84D)',
        'rank-platinum': 'linear-gradient(135deg, #8FCDDD, #5AAABB)',
        'rank-diamond':  'linear-gradient(135deg, #B9F2FF, #70CFEE)',
        'rank-nexora':   'linear-gradient(135deg, #9B81FF, #7C5CFC, #5E3DE8)',
      },

      backdropBlur: {
        'none':  '0',
        'xs':    '2px',
        'sm':    '4px',
        'md':    '8px',
        'lg':    '16px',
        'xl':    '24px',
        'glass': '12px',
      },

      // ── Animation & Keyframes ─────────────────────────
      transitionTimingFunction: {
        'spring':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':      'cubic-bezier(0.4, 0, 0.2, 1)',
        'in-back':     'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'out-back':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'decelerate':  'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate':  'cubic-bezier(0.4, 0, 1, 1)',
      },

      transitionDuration: {
        '75':  '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '1000':'1000ms',
        '1200':'1200ms',
        '1500':'1500ms',
        '2000':'2000ms',
      },

      keyframes: {
        // ── Entrance animations ──────────────────────────
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-in-spring': {
          '0%':   { opacity: '0', transform: 'scale(0.7)' },
          '70%':  { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },

        // ── Exit animations ──────────────────────────────
        'fade-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-out-down': {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(16px)' },
        },
        'scale-out': {
          '0%':   { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },

        // ── Ambient / looping ────────────────────────────
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124,92,252,0.3), 0 0 20px rgba(124,92,252,0.1)' },
          '50%':      { boxShadow: '0 0 20px rgba(124,92,252,0.6), 0 0 40px rgba(124,92,252,0.3)' },
        },
        'pulse-ember': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255,184,77,0.3), 0 0 20px rgba(255,184,77,0.1)' },
          '50%':      { boxShadow: '0 0 20px rgba(255,184,77,0.6), 0 0 40px rgba(255,184,77,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
        'orbit': {
          '0%':   { transform: 'rotate(0deg) translateX(4px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(4px) rotate(-360deg)' },
        },
        'bg-pan': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },

        // ── Progress / fill ──────────────────────────────
        'fill-bar': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--fill-width, 100%)' },
        },
        'fill-bar-spring': {
          '0%':   { width: '0%' },
          '80%':  { width: 'calc(var(--fill-width, 100%) + 4%)' },
          '100%': { width: 'var(--fill-width, 100%)' },
        },

        // ── XP / reward ──────────────────────────────────
        'xp-burst': {
          '0%':   { opacity: '1', transform: 'scale(1)    translateY(0)' },
          '60%':  { opacity: '1', transform: 'scale(1.4)  translateY(-32px)' },
          '100%': { opacity: '0', transform: 'scale(0.8)  translateY(-64px)' },
        },
        'xp-number-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.8)' },
          '30%':  { opacity: '1', transform: 'translateY(-4px) scale(1.15)' },
          '100%': { opacity: '0', transform: 'translateY(-24px) scale(0.9)' },
        },
        'rank-up': {
          '0%':   { opacity: '0', transform: 'scale(0.3) rotate(-15deg)' },
          '50%':  { opacity: '1', transform: 'scale(1.2) rotate(3deg)' },
          '70%':  { transform: 'scale(0.95) rotate(-1deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'achievement-unlock': {
          '0%':   { opacity: '0', transform: 'scale(0.5) translateY(20px)' },
          '40%':  { opacity: '1', transform: 'scale(1.1) translateY(-4px)' },
          '65%':  { transform: 'scale(0.97) translateY(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'coin-spin': {
          '0%':   { transform: 'rotateY(0deg) scale(1)' },
          '50%':  { transform: 'rotateY(180deg) scale(1.1)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
        'reward-reveal': {
          '0%':   { opacity: '0', filter: 'blur(8px)', transform: 'scale(0.8)' },
          '60%':  { filter: 'blur(0px)', transform: 'scale(1.05)' },
          '100%': { opacity: '1', filter: 'blur(0px)', transform: 'scale(1)' },
        },

        // ── Streak / fire ────────────────────────────────
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)',    filter: 'brightness(1)' },
          '50%':      { transform: 'scale(1.12)', filter: 'brightness(1.3)' },
        },
        'fire-flicker': {
          '0%':   { transform: 'scaleY(1)    scaleX(1)   translateY(0)' },
          '25%':  { transform: 'scaleY(1.05) scaleX(0.97) translateY(-1px)' },
          '50%':  { transform: 'scaleY(0.97) scaleX(1.02) translateY(1px)' },
          '75%':  { transform: 'scaleY(1.03) scaleX(0.98) translateY(-1px)' },
          '100%': { transform: 'scaleY(1)    scaleX(1)   translateY(0)' },
        },

        // ── UI states ────────────────────────────────────
        'press': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-4deg)' },
          '75%':      { transform: 'rotate(4deg)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        'ping-once': {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '80%':  { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },

        // ── Skeleton ─────────────────────────────────────
        'skeleton': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },

        // ── Leaderboard ──────────────────────────────────
        'rank-climb': {
          '0%':   { transform: 'translateY(8px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        'rank-drop': {
          '0%':   { transform: 'translateY(-8px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },

        // ── Particles ────────────────────────────────────
        'particle-rise': {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(0.3)' },
        },
      },

      animation: {
        // Entrance
        'fade-in':         'fade-in 0.3s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in-up':      'fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in-down':    'fade-in-down 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in-left':    'fade-in-left 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in-right':   'fade-in-right 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in':        'scale-in 0.3s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in-spring': 'scale-in-spring 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up':        'slide-up 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'slide-down':      'slide-down 0.4s cubic-bezier(0.4,0,0.2,1) both',

        // Exit
        'fade-out':        'fade-out 0.2s cubic-bezier(0.4,0,0.2,1) both',
        'fade-out-down':   'fade-out-down 0.2s cubic-bezier(0.4,0,0.2,1) both',
        'scale-out':       'scale-out 0.2s cubic-bezier(0.4,0,0.2,1) both',

        // Looping
        'shimmer':         'shimmer 2s linear infinite',
        'pulse-glow':      'pulse-glow 2.5s ease-in-out infinite',
        'pulse-ember':     'pulse-ember 2.5s ease-in-out infinite',
        'float':           'float 4s ease-in-out infinite',
        'sway':            'sway 3s ease-in-out infinite',
        'bg-pan':          'bg-pan 8s ease infinite',
        'spin-slow':       'spin-slow 8s linear infinite',

        // Progress
        'fill-bar':        'fill-bar 0.8s cubic-bezier(0.4,0,0.2,1) both',
        'fill-bar-spring': 'fill-bar-spring 0.9s cubic-bezier(0.34,1.56,0.64,1) both',

        // Rewards
        'xp-burst':        'xp-burst 1s cubic-bezier(0.4,0,0.2,1) both',
        'xp-number-up':    'xp-number-up 1.2s ease-out both',
        'rank-up':         'rank-up 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
        'achievement-unlock':'achievement-unlock 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
        'coin-spin':       'coin-spin 0.6s ease-in-out',
        'reward-reveal':   'reward-reveal 0.6s cubic-bezier(0.4,0,0.2,1) both',

        // Streak
        'streak-pulse':    'streak-pulse 1.8s ease-in-out infinite',
        'fire-flicker':    'fire-flicker 0.5s ease-in-out infinite',

        // UI
        'press':           'press 0.15s ease-in-out',
        'bounce-sm':       'bounce-sm 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'wiggle':          'wiggle 0.4s ease-in-out',
        'shake':           'shake 0.4s ease-in-out',
        'ping-once':       'ping-once 0.7s ease-out both',

        // Skeleton
        'skeleton':        'skeleton 1.5s ease-in-out infinite',

        // Leaderboard
        'rank-climb':      'rank-climb 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'rank-drop':       'rank-drop 0.4s cubic-bezier(0.4,0,0.2,1) both',

        // Particles
        'particle-rise':   'particle-rise 1s ease-out both',
        'fire-flicker-slow':'fire-flicker 0.8s ease-in-out infinite',
      },

      // Stagger delays for list animations
      animationDelay: {
        '0':    '0ms',
        '75':   '75ms',
        '100':  '100ms',
        '150':  '150ms',
        '200':  '200ms',
        '300':  '300ms',
        '400':  '400ms',
        '500':  '500ms',
        '600':  '600ms',
        '700':  '700ms',
        '1000': '1000ms',
      },

      screens: {
        'xs':  '480px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },

      zIndex: {
        'behind':  '-1',
        '0':       '0',
        '10':      '10',
        '20':      '20',
        '30':      '30',
        '40':      '40',
        '50':      '50',
        'sticky':  '100',
        'header':  '200',
        'modal':   '300',
        'toast':   '400',
        'tooltip': '500',
        'overlay': '600',
      },

      blur: {
        'none':  '0',
        'xs':    '2px',
        'sm':    '4px',
        'md':    '8px',
        'lg':    '16px',
        'xl':    '24px',
        '2xl':   '40px',
        '3xl':   '64px',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents, theme }) {
      // ── Glass morphism utilities ──────────────────────
      addUtilities({
        '.glass': {
          background:     'rgba(28,38,64,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:         '1px solid rgba(230,237,247,0.08)',
        },
        '.glass-heavy': {
          background:     'rgba(20,27,45,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:         '1px solid rgba(230,237,247,0.10)',
        },
        '.glass-light': {
          background:     'rgba(28,38,64,0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border:         '1px solid rgba(230,237,247,0.06)',
        },

        // ── Text gradients ───────────────────────────
        '.text-gradient-accent': {
          background:            'linear-gradient(135deg, #9B81FF 0%, #7C5CFC 50%, #5E3DE8 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-cyan': {
          background:            'linear-gradient(135deg, #33DEFF 0%, #00D4FF 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-ember': {
          background:            'linear-gradient(135deg, #FFD080 0%, #FFB84D 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-gold': {
          background:            'linear-gradient(135deg, #FFD080 0%, #FFB84D 50%, #E8960A 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-diamond': {
          background:            'linear-gradient(135deg, #E0F8FF 0%, #B9F2FF 50%, #70CFEE 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-emerald': {
          background:            'linear-gradient(135deg, #33E8B8 0%, #00C896 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },
        '.text-gradient-nexora': {
          background:            'linear-gradient(135deg, #9B81FF 0%, #7C5CFC 35%, #00D4FF 100%)',
          WebkitBackgroundClip:  'text',
          WebkitTextFillColor:   'transparent',
          backgroundClip:        'text',
        },

        // ── Skeleton shimmer ──────────────────────────
        '.skeleton': {
          background:   'linear-gradient(90deg, rgba(28,38,64,0.8) 25%, rgba(40,55,88,0.55) 50%, rgba(28,38,64,0.8) 75%)',
          backgroundSize: '800px 100%',
          animation:    'skeleton 1.5s ease-in-out infinite',
        },

        // ── Scrollbar ─────────────────────────────────
        '.scrollbar-nexora': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(124,92,252,0.5) #0B1020',
        },
        '.scrollbar-nexora::-webkit-scrollbar': {
          width: '4px',
          height: '4px',
        },
        '.scrollbar-nexora::-webkit-scrollbar-track': {
          background: '#0B1020',
        },
        '.scrollbar-nexora::-webkit-scrollbar-thumb': {
          background:   'rgba(124,92,252,0.5)',
          borderRadius: '2px',
        },

        // ── Focus ring ────────────────────────────────
        '.focus-nexora': {
          outline:      'none',
          boxShadow:    '0 0 0 2px rgba(124,92,252,0.55)',
        },
        '.focus-nexora:focus-visible': {
          outline:      'none',
          boxShadow:    '0 0 0 2px rgba(124,92,252,0.55)',
        },

        // ── Noise texture overlay ─────────────────────
        '.noise': {
          position:        'relative',
        },
        '.noise::before': {
          content:         '""',
          position:        'absolute',
          inset:           '0',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
          opacity:         '0.03',
          pointerEvents:   'none',
          zIndex:          '1',
        },

        // ── No text select ────────────────────────────
        '.no-select': {
          userSelect:    'none',
          WebkitUserSelect: 'none',
        },

        // ── Stagger animation delays ──────────────────
        '.stagger-1': { animationDelay: '75ms' },
        '.stagger-2': { animationDelay: '150ms' },
        '.stagger-3': { animationDelay: '225ms' },
        '.stagger-4': { animationDelay: '300ms' },
        '.stagger-5': { animationDelay: '375ms' },
        '.stagger-6': { animationDelay: '450ms' },

        // ── Glow borders ──────────────────────────────
        '.border-glow-accent': {
          borderColor:  'rgba(124,92,252,0.4)',
          boxShadow:    'inset 0 0 0 1px rgba(124,92,252,0.4)',
        },
        '.border-glow-cyan': {
          borderColor:  'rgba(0,212,255,0.4)',
          boxShadow:    'inset 0 0 0 1px rgba(0,212,255,0.4)',
        },
        '.border-glow-ember': {
          borderColor:  'rgba(255,184,77,0.4)',
          boxShadow:    'inset 0 0 0 1px rgba(255,184,77,0.4)',
        },
        '.border-glow-emerald': {
          borderColor:  'rgba(0,200,150,0.4)',
          boxShadow:    'inset 0 0 0 1px rgba(0,200,150,0.4)',
        },
      });

      // ── Reusable component classes ────────────────────
      addComponents({
        '.card': {
          background:   'linear-gradient(145deg, rgba(28,38,64,0.9) 0%, rgba(20,27,45,0.95) 100%)',
          border:       '1px solid rgba(230,237,247,0.07)',
          borderRadius: '16px',
          boxShadow:    '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.05)',
          transition:   'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            boxShadow:  '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.07)',
            borderColor:'rgba(230,237,247,0.11)',
            transform:  'translateY(-2px)',
          },
        },
        '.card-premium': {
          background:   'linear-gradient(145deg, rgba(124,92,252,0.1) 0%, rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98) 100%)',
          border:       '1px solid rgba(124,92,252,0.18)',
          borderRadius: '16px',
          boxShadow:    '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,252,0.08)',
          '&:hover': {
            border:     '1px solid rgba(124,92,252,0.32)',
            boxShadow:  '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(124,92,252,0.2)',
            transform:  'translateY(-2px)',
          },
        },
        '.card-cyan': {
          background:   'linear-gradient(145deg, rgba(0,212,255,0.08) 0%, rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98) 100%)',
          border:       '1px solid rgba(0,212,255,0.15)',
          borderRadius: '16px',
          transition:   'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            border:     '1px solid rgba(0,212,255,0.28)',
            boxShadow:  '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,212,255,0.18)',
            transform:  'translateY(-2px)',
          },
        },
        '.btn': {
          display:        'inline-flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '8px',
          borderRadius:   '10px',
          fontFamily:     '"Space Grotesk", Inter, sans-serif',
          fontWeight:     '600',
          fontSize:       '0.9375rem',
          lineHeight:     '1',
          padding:        '12px 20px',
          transition:     'all 0.15s cubic-bezier(0.4,0,0.2,1)',
          cursor:         'pointer',
          userSelect:     'none',
          outline:        'none',
          border:         'none',
          '&:active': {
            transform:    'scale(0.97)',
          },
          '&:focus-visible': {
            boxShadow:    '0 0 0 2px rgba(124,92,252,0.55)',
          },
          '&:disabled': {
            opacity:    '0.38',
            cursor:     'not-allowed',
            transform:  'none',
          },
        },
        '.btn-primary': {
          background:   'linear-gradient(135deg, #9B81FF 0%, #7C5CFC 50%, #5E3DE8 100%)',
          color:        '#F0F5FF',
          boxShadow:    '0 4px 14px rgba(124,92,252,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A98EFF 0%, #8B6DFF 50%, #6E4EF5 100%)',
            boxShadow:  '0 6px 22px rgba(124,92,252,0.6), inset 0 1px 0 rgba(255,255,255,0.22)',
            transform:  'translateY(-1px)',
          },
        },
        '.btn-cyan': {
          background:   'linear-gradient(135deg, #33DEFF 0%, #00D4FF 50%, #00A8CC 100%)',
          color:        '#0B1020',
          fontWeight:   '700',
          boxShadow:    '0 4px 14px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #55E4FF 0%, #22DCFF 50%, #00BCDF 100%)',
            boxShadow:  '0 6px 22px rgba(0,212,255,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
            transform:  'translateY(-1px)',
          },
        },
        '.btn-ember': {
          background:   'linear-gradient(135deg, #FFD080 0%, #FFB84D 50%, #E8960A 100%)',
          color:        '#0B1020',
          fontWeight:   '700',
          boxShadow:    '0 4px 14px rgba(255,184,77,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFD980 0%, #FFC055 50%, #F0A020 100%)',
            boxShadow:  '0 6px 22px rgba(255,184,77,0.55), inset 0 1px 0 rgba(255,255,255,0.22)',
            transform:  'translateY(-1px)',
          },
        },
        '.btn-emerald': {
          background:   'linear-gradient(135deg, #33E8B8 0%, #00C896 50%, #009E78 100%)',
          color:        '#0B1020',
          fontWeight:   '700',
          boxShadow:    '0 4px 14px rgba(0,200,150,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
          '&:hover': {
            background: 'linear-gradient(135deg, #44F0C4 0%, #11D4A0 50%, #00AE88 100%)',
            boxShadow:  '0 6px 22px rgba(0,200,150,0.55), inset 0 1px 0 rgba(255,255,255,0.22)',
            transform:  'translateY(-1px)',
          },
        },
        '.btn-ghost': {
          background:   'transparent',
          color:        'rgba(230,237,247,0.72)',
          border:       '1px solid rgba(230,237,247,0.14)',
          '&:hover': {
            background: 'rgba(230,237,247,0.06)',
            color:      '#E6EDF7',
            border:     '1px solid rgba(230,237,247,0.24)',
          },
        },
        '.btn-surface': {
          background:   'rgba(28,38,64,0.9)',
          color:        'rgba(230,237,247,0.8)',
          border:       '1px solid rgba(230,237,247,0.1)',
          '&:hover': {
            background: 'rgba(36,50,80,0.95)',
            border:     '1px solid rgba(230,237,247,0.2)',
          },
        },
        '.badge': {
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '4px',
          padding:        '3px 10px',
          borderRadius:   '6px',
          fontSize:       '0.6875rem',
          fontWeight:     '700',
          fontFamily:     '"Space Grotesk", sans-serif',
          lineHeight:     '1.4',
          letterSpacing:  '0.05em',
          textTransform:  'uppercase',
          whiteSpace:     'nowrap',
        },
        '.badge-accent': {
          background:   'rgba(124,92,252,0.15)',
          color:        '#9B81FF',
          border:       '1px solid rgba(124,92,252,0.3)',
        },
        '.badge-cyan': {
          background:   'rgba(0,212,255,0.12)',
          color:        '#33DEFF',
          border:       '1px solid rgba(0,212,255,0.28)',
        },
        '.badge-ember': {
          background:   'rgba(255,184,77,0.12)',
          color:        '#FFD080',
          border:       '1px solid rgba(255,184,77,0.28)',
        },
        '.badge-success': {
          background:   'rgba(0,200,150,0.12)',
          color:        '#33E8B8',
          border:       '1px solid rgba(0,200,150,0.28)',
        },
        '.badge-warning': {
          background:   'rgba(255,184,77,0.12)',
          color:        '#FFD080',
          border:       '1px solid rgba(255,184,77,0.28)',
        },
      });
    },
  ],
};
