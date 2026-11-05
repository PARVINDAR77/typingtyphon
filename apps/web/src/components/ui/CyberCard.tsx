'use client';

import React from 'react';

interface CyberCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowOnHover?: boolean;
  hoverEffect?: boolean;
  accentBorder?: 'blue' | 'cyan' | 'purple' | 'subtle';
  padding?: string;
  onClick?: () => void;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  className = '',
  style = {},
  glowOnHover = true,
  hoverEffect,
  accentBorder = 'subtle',
  padding = '1.25rem',
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const shouldGlow = hoverEffect !== undefined ? hoverEffect : glowOnHover;

  const getBorderColor = () => {
    if (isHovered && shouldGlow) {
      if (accentBorder === 'cyan') return '#00D9FF';
      if (accentBorder === 'purple') return '#8257FF';
      return '#168BFF';
    }
    if (accentBorder === 'cyan') return 'rgba(0, 217, 255, 0.28)';
    if (accentBorder === 'purple') return 'rgba(130, 87, 255, 0.28)';
    if (accentBorder === 'blue') return 'rgba(22, 139, 255, 0.28)';
    return 'var(--border-subtle, rgba(120, 160, 255, 0.18))';
  };

  const getBoxShadow = () => {
    if (isHovered && shouldGlow) {
      if (accentBorder === 'cyan') return '0 8px 32px -4px rgba(0, 217, 255, 0.25)';
      if (accentBorder === 'purple') return '0 8px 32px -4px rgba(130, 87, 255, 0.25)';
      return '0 8px 32px -4px rgba(22, 139, 255, 0.25)';
    }
    return 'var(--shadow-card, 0 4px 20px -2px rgba(0, 0, 0, 0.5))';
  };

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--bg-card, #101D36)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '16px',
        padding,
        boxShadow: getBoxShadow(),
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && glowOnHover && onClick ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Corner Cyber Accent Notches */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '12px',
          height: '12px',
          borderTop: '2px solid rgba(0, 217, 255, 0.4)',
          borderLeft: '2px solid rgba(0, 217, 255, 0.4)',
          borderTopLeftRadius: '16px',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '12px',
          height: '12px',
          borderBottom: '2px solid rgba(130, 87, 255, 0.4)',
          borderRight: '2px solid rgba(130, 87, 255, 0.4)',
          borderBottomRightRadius: '16px',
          pointerEvents: 'none',
        }}
      />
      {children}
    </div>
  );
};

