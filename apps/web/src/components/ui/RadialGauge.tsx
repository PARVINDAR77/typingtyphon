'use client';

import React from 'react';

interface RadialGaugeProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  accentColor?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  size = 140,
  strokeWidth = 10,
  label = 'Accuracy',
  sublabel,
  accentColor = '#00D9FF',
}) => {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="radialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="50%" stopColor="#168BFF" />
            <stop offset="100%" stopColor="#8257FF" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(120, 160, 255, 0.12)"
          strokeWidth={strokeWidth}
        />

        {/* Animated active progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#radialGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          style={{
            transition: 'stroke-dashoffset 0.4s ease-out',
          }}
        />
      </svg>

      {/* Center Value Content */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: size > 120 ? '1.85rem' : '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading), var(--font-sans)',
            color: '#F5F7FF',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {clampedValue}%
        </div>
        {label && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text-secondary)',
              marginTop: '0.2rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {label}
          </span>
        )}
        {sublabel && (
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

