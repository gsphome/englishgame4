import React from 'react';

interface FluentFlowIconProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'monochrome' | 'outline';
}

export const FluentFlowIcon: React.FC<FluentFlowIconProps> = ({ 
  size = 24, 
  className = '',
  variant = 'default'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'monochrome':
        return {
          bg: 'currentColor',
          lines: 'white',
          text: 'white'
        };
      case 'outline':
        return {
          bg: 'none',
          lines: 'currentColor',
          text: 'currentColor',
          stroke: 'currentColor'
        };
      default:
        return {
          bg: 'url(#iconGradient)',
          lines: 'white',
          text: 'white'
        };
    }
  };

  const colors = getColors();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {variant === 'default' && (
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      )}
      
      {/* Background */}
      {variant === 'outline' ? (
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="none" 
          stroke={colors.stroke}
          strokeWidth="1.5"
        />
      ) : (
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill={colors.bg}
        />
      )}
      
      {/* Flow lines */}
      <path 
        d="M6 9 Q12 7 18 9" 
        stroke={colors.lines} 
        strokeWidth="1.2" 
        fill="none" 
        strokeLinecap="round" 
        opacity="0.9"
      />
      <path 
        d="M6 12 Q12 10 18 12" 
        stroke={colors.lines} 
        strokeWidth="1" 
        fill="none" 
        strokeLinecap="round" 
        opacity="0.7"
      />
      <path 
        d="M6 15 Q12 13 18 15" 
        stroke={colors.lines} 
        strokeWidth="0.8" 
        fill="none" 
        strokeLinecap="round" 
        opacity="0.5"
      />
      
      {/* Letter F */}
      <text 
        x="12" 
        y="18" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="9" 
        fontWeight="700" 
        textAnchor="middle" 
        fill={colors.text}
      >
        F
      </text>
    </svg>
  );
};