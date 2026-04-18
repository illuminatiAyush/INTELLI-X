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
              : 'bg-black text-white shadow-none'
            : isDark
              ? 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
              : 'bg-black/5 text-gray-400 hover:bg-black/10 hover:text-black'
        )
      } ${className}`}
      style={{ width: `${wrapperSize}px`, height: `${wrapperSize}px` }}
    >
      <Icon size={iconSize} strokeWidth={active ? 2.5 : 2} stroke="currentColor" />
    </div>
  );
};

export default IconWrapper;
