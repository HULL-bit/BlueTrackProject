import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  className?: string;
  animated?: boolean;
  withBackground?: boolean;
  darkBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  animated = true,
  withBackground = false,
  darkBackground = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  // SVG du logo WAGADU BLUE BALANCE
  const WagaduIcon = () => (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${withBackground ? 'bg-white rounded-full p-2' : ''}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cercle extérieur épais */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="#1e40af"
        strokeWidth="6"
      />
      
      {/* Balance de justice - Fulcrum (pivot central) */}
      <line x1="50" y1="20" x2="50" y2="40" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="50" cy="20" r="4" fill="#D4AF37"/>
      
      {/* Barre horizontale de la balance */}
      <line x1="30" y1="40" x2="70" y2="40" stroke="#D4AF37" strokeWidth="3"/>
      
      {/* Pans de la balance (bleus) */}
      <ellipse cx="35" cy="48" rx="10" ry="4" fill="#1e40af" stroke="#1e40af" strokeWidth="1"/>
      <ellipse cx="65" cy="48" rx="10" ry="4" fill="#1e40af" stroke="#1e40af" strokeWidth="1"/>
      
      {/* Lignes de suspension des pans */}
      <line x1="35" y1="40" x2="35" y2="48" stroke="#D4AF37" strokeWidth="2"/>
      <line x1="65" y1="40" x2="65" y2="48" stroke="#D4AF37" strokeWidth="2"/>
      
      {/* Fond bleu pour les vagues */}
      <rect x="2" y="55" width="96" height="43" fill="#3b82f6" rx="0"/>
      
      {/* Vagues stylisées (3 lignes) */}
      <path
        d="M5 65 Q15 60 25 65 T45 65 T65 65 T85 65 T95 65"
        stroke="#60a5fa"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M5 72 Q15 69 25 72 T45 72 T65 72 T85 72 T95 72"
        stroke="#60a5fa"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M5 79 Q15 76 25 79 T45 79 T65 79 T85 79 T95 79"
        stroke="#60a5fa"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );

  // Composant animé
  const AnimatedWagaduIcon = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <WagaduIcon />
    </motion.div>
  );

  if (variant === 'icon') {
    return animated ? <AnimatedWagaduIcon /> : <WagaduIcon />;
  }

  if (variant === 'wordmark') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`flex items-center space-x-3 ${darkBackground ? 'bg-black rounded-lg p-3' : ''} ${className}`}
      >
        <WagaduIcon />
        <div className="flex flex-col">
          <span className={`font-bold ${darkBackground ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'} ${textSizeClasses[size]}`}>
            BLUE TRACK
          </span>
          <span className={`text-xs font-medium ${darkBackground ? 'text-gray-300' : 'text-gray-500'}`}>
            Tracking the sea, protecting lives
          </span>
        </div>
      </motion.div>
    );
  }

  // Variant 'full' par défaut
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col items-center space-y-2 ${darkBackground ? 'bg-black rounded-lg p-4' : ''} ${className}`}
    >
      {animated ? <AnimatedWagaduIcon /> : <WagaduIcon />}
      <div className="text-center">
        <h1 className={`font-bold ${darkBackground ? 'text-white' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent'} ${textSizeClasses[size]}`}>
          BLUE TRACK
        </h1>
        <p className={`text-sm font-medium ${darkBackground ? 'text-gray-300' : 'text-gray-600'}`}>
          Tracking the sea, protecting lives
        </p>
      </div>
    </motion.div>
  );
};

export default Logo;
