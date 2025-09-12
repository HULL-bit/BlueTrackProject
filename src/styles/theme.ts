// Configuration du thème bleu sombre brillant
export const theme = {
  colors: {
    // Couleurs principales - Bleu sombre brillant
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
    // Couleurs secondaires - Cyan brillant
    secondary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344'
    },
    
    // Couleurs d'accent - Indigo brillant
    accent: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b'
    },
    
    // Couleurs de statut
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    
    // Couleurs neutres - Gris sombre
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    }
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
    secondary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    accent: 'linear-gradient(135deg, #312e81 0%, #6366f1 50%, #a5b4fc 100%)',
    ocean: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 25%, #0284c7 50%, #0ea5e9 75%, #38bdf8 100%)',
    sunset: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 25%, #f59e0b 50%, #eab308 75%, #84cc16 100%)',
    aurora: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #3b82f6 50%, #06b6d4 75%, #10b981 100%)'
  },
  
  // Ombres
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
    glowSecondary: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  // Bordures
  borders: {
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px'
    }
  },
  
  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '1000ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },
  
  // Typographie
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },
  
  // Espacement
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem'
  },
  
  // Z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Classes CSS utilitaires pour le thème
export const themeClasses = {
  // Backgrounds
  bgPrimary: 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700',
  bgSecondary: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700',
  bgAccent: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700',
  bgOcean: 'bg-gradient-to-br from-cyan-900 via-blue-800 to-blue-600',
  
  // Text
  textPrimary: 'text-blue-100',
  textSecondary: 'text-slate-200',
  textAccent: 'text-cyan-200',
  
  // Borders
  borderPrimary: 'border-blue-500',
  borderSecondary: 'border-slate-600',
  borderAccent: 'border-cyan-500',
  
  // Shadows
  shadowGlow: 'shadow-lg shadow-blue-500/25',
  shadowGlowSecondary: 'shadow-lg shadow-cyan-500/25',
  shadowInner: 'shadow-inner',
  
  // Hover effects
  hoverGlow: 'hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300',
  hoverGlowSecondary: 'hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300',
  
  // Focus effects
  focusGlow: 'focus:ring-4 focus:ring-blue-500/25 focus:outline-none',
  focusGlowSecondary: 'focus:ring-4 focus:ring-cyan-500/25 focus:outline-none',
  
  // Glass effect
  glass: 'bg-white/10 backdrop-blur-md border border-white/20',
  glassDark: 'bg-black/20 backdrop-blur-md border border-white/10',
  
  // Button styles
  btnPrimary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300',
  btnSecondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30 transition-all duration-300',
  btnAccent: 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300',
  
  // Card styles
  card: 'bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl shadow-slate-500/10',
  cardDark: 'bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/20',
  
  // Input styles
  input: 'bg-white/90 border border-slate-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300',
  inputDark: 'bg-slate-700/90 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300',
  
  // Sidebar styles
  sidebar: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50',
  sidebarItem: 'text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg px-4 py-3 transition-all duration-300',
  sidebarItemActive: 'text-white bg-blue-600/20 border-r-2 border-blue-500 rounded-lg px-4 py-3',
  
  // Navigation styles
  nav: 'bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg shadow-slate-500/10',
  navDark: 'bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-slate-900/20',
  
  // Status indicators
  statusOnline: 'bg-green-500/20 text-green-400 border border-green-500/30',
  statusOffline: 'bg-red-500/20 text-red-400 border border-red-500/30',
  statusWarning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  statusInfo: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
};

export default theme;
