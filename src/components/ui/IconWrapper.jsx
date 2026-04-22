import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Global IconWrapper to enforce strict dimensions, centering, and theme colors.
 * Used for standalone icons like Sidebar Navs, Dashboard Cards, and Hero features.
 */
const IconWrapper = ({ icon: Icon, active, className = '', wrapperSize = 48, iconSize = 20, colorOverride = false }) => {
  const { isDark } = useTheme();

  return (
    <div 
      className={`flex items-center justify-center rounded-2xl transition-all duration-300 flex-shrink-0 ${
        colorOverride ? '' : (
          active 
            ? isDark 
              ? 'bg-white text-black shadow-none' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20'
            : isDark
              ? 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
              : 'bg-black/5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-600'
        )
      } ${className}`}
      style={{ width: `${wrapperSize}px`, height: `${wrapperSize}px` }}
    >
      <Icon size={iconSize} strokeWidth={active ? 2.5 : 2} stroke="currentColor" />
    </div>
  );
};

export default IconWrapper;
