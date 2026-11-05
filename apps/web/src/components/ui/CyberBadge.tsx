'use client';

import React from 'react';

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'blue' | 'gold' | 'emerald';
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  glow?: boolean;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = 'cyan',
  icon,
  size = 'md',
  glow = false,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'cyan':
        return {
          bg: 'rgba(0, 217, 255, 0.1)',
          border: 'rgba(0, 217, 255, 0.35)',
          text: '#00D9FF',
          dot: '#00D9FF',
        };
      case 'purple':
        return {
          bg: 'rgba(130, 87, 255, 0.12)',
          border: 'rgba(130, 87, 255, 0.35)',
          text: '#A78BFA',
          dot: '#8257FF',
        };
      case 'gold':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#FBBF24',
          dot: '#F59E0B',
        };
      case 'emerald':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          text: '#34D399',
          dot: '#10B981',
        };
      default:
        return {
          bg: 'rgba(22, 139, 255, 0.12)',
          border: 'rgba(22, 139, 255, 0.35)',
          text: '#38BDF8',
          dot: '#168BFF',
        };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.28rem 0.85rem',
        borderRadius: '9999px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        fontWeight: 700,
        fontFamily: 'var(--font-heading), var(--font-sans)',
        letterSpacing: '0.04em',
        boxShadow: `0 0 12px ${colors.bg}`,
        userSelect: 'none',
      }}
    >
      {icon ? (
        icon
      ) : (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.dot,
            boxShadow: `0 0 8px ${colors.dot}`,
          }}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

