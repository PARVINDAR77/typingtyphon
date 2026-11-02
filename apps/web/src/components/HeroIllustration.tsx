import React from 'react';

export const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 460 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="heroBgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#168BFF" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#5B5FEF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8057E8" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="heroLaptop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="heroScreenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#168BFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="heroKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EDF4FC" />
          </linearGradient>

          <linearGradient id="heroAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#168BFF" />
            <stop offset="100%" stopColor="#5B5FEF" />
          </linearGradient>

          <linearGradient id="heroPlantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <filter id="heroDropShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#168BFF" floodOpacity="0.18" />
          </filter>

          <filter id="heroCardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Soft Ambient Radial Background Halo */}
        <circle cx="230" cy="150" r="140" fill="url(#heroBgGlow)" />
        <ellipse cx="230" cy="245" rx="170" ry="18" fill="#168BFF" fillOpacity="0.08" />

        {/* Modern Minimalist Desk Surface */}
        <rect x="50" y="240" width="360" height="8" rx="4" fill="var(--border-subtle, #E1E9F3)" />

        {/* Stack of Colorful Books on Left */}
        <g transform="translate(70, 195)">
          {/* Bottom Book (Purple) */}
          <rect x="0" y="32" width="60" height="12" rx="3" fill="#8057E8" />
          <rect x="5" y="34" width="4" height="8" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
          {/* Middle Book (Emerald) */}
          <rect x="6" y="20" width="52" height="11" rx="3" fill="#10B981" />
          <rect x="10" y="22" width="3" height="7" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
          {/* Top Book (Blue) */}
          <rect x="12" y="10" width="44" height="9" rx="2" fill="#168BFF" />
          {/* Coffee Mug on top of books */}
          <rect x="22" y="0" width="16" height="12" rx="3" fill="#FFFFFF" stroke="#C9E5FF" strokeWidth="1.5" />
          <path d="M38 3 C 43 3, 43 9, 38 9" fill="none" stroke="#C9E5FF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Steam curls */}
          <path d="M26 -3 Q 28 -7 27 -10" stroke="#168BFF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M32 -2 Q 34 -6 33 -9" stroke="#168BFF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>

        {/* Modern Monstera / Potted Plant on Right */}
        <g transform="translate(340, 175)">
          {/* Pot */}
          <path d="M12 40 L16 64 C 16 66, 36 66, 36 64 L40 40 Z" fill="#F59E0B" fillOpacity="0.9" />
          <ellipse cx="26" cy="40" rx="14" ry="3" fill="#D97706" />
          {/* Leaves */}
          <path d="M26 38 Q 10 20 6 6 Q 20 12 26 38 Z" fill="url(#heroPlantGrad)" />
          <path d="M26 38 Q 42 18 48 4 Q 34 14 26 38 Z" fill="#10B981" />
          <path d="M26 38 Q 26 12 24 -2 Q 32 10 26 38 Z" fill="#34D399" />
          {/* Leaf vein */}
          <path d="M26 38 Q 12 22 8 8" stroke="#065F46" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M26 38 Q 38 20 44 6" stroke="#065F46" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>

        {/* Stylized Modern Learner Character */}
        <g transform="translate(165, 80)">
          {/* Friendly Head / Face */}
          <circle cx="65" cy="30" r="22" fill="#FDE68A" />
          {/* Stylish Hair */}
          <path d="M44 26 C 44 10, 60 4, 76 8 C 88 12, 88 24, 86 28 C 82 20, 72 16, 60 18 C 50 20, 46 24, 44 26 Z" fill="#1E293B" />
          <circle cx="86" cy="24" r="5" fill="#1E293B" />
          {/* Glasses */}
          <circle cx="58" cy="30" r="6" fill="none" stroke="#168BFF" strokeWidth="1.8" />
          <circle cx="72" cy="30" r="6" fill="none" stroke="#168BFF" strokeWidth="1.8" />
          <path d="M64 30 L66 30" stroke="#168BFF" strokeWidth="1.8" strokeLinecap="round" />
          {/* Friendly Smile */}
          <path d="M61 38 Q 65 42 69 38" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Torso / Modern Hoodie with Brand Gradient */}
          <path d="M38 60 C 38 52, 50 48, 65 48 C 80 48, 92 52, 92 60 L100 130 C 100 132, 30 132, 30 130 Z" fill="url(#heroAccentGrad)" />
          {/* Hoodie collar & strings */}
          <path d="M55 48 L65 62 L75 48" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
          <path d="M62 62 L60 76" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M68 62 L70 76" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

          {/* Left Arm reaching to keyboard */}
          <path d="M36 65 C 24 85, 20 115, 42 125 L 56 122" stroke="url(#heroAccentGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Left hand on keyboard */}
          <circle cx="58" cy="122" r="6" fill="#FDE68A" />

          {/* Right Arm reaching to keyboard */}
          <path d="M94 65 C 106 85, 110 115, 88 125 L 74 122" stroke="url(#heroAccentGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
          {/* Right hand on keyboard */}
          <circle cx="72" cy="122" r="6" fill="#FDE68A" />
        </g>

        {/* Modern Laptop on Desk */}
        <g transform="translate(180, 175)">
          {/* Laptop Screen (angled open) */}
          <path d="M15 12 L85 12 L78 60 L22 60 Z" fill="url(#heroLaptop)" rx="2" />
          <path d="M19 15 L81 15 L75 57 L25 57 Z" fill="#0F172A" />
          {/* Screen glow & code/text lines */}
          <rect x="23" y="18" width="54" height="36" rx="2" fill="url(#heroScreenGlow)" />
          <rect x="27" y="24" width="22" height="3" rx="1.5" fill="#168BFF" />
          <rect x="52" y="24" width="16" height="3" rx="1.5" fill="#10B981" />
          <rect x="27" y="31" width="34" height="3" rx="1.5" fill="#38BDF8" opacity="0.8" />
          <rect x="27" y="38" width="28" height="3" rx="1.5" fill="#8057E8" opacity="0.8" />
          <rect x="27" y="45" width="18" height="3" rx="1.5" fill="#F59E0B" opacity="0.8" />
          {/* Cursor pulse on screen */}
          <rect x="48" y="45" width="2" height="4" rx="1" fill="#FFFFFF" />

          {/* Laptop Base (flat on desk) */}
          <path d="M8 60 L92 60 L98 67 L2 67 Z" fill="#94A3B8" />
          <path d="M12 60 L88 60 L92 65 L8 65 Z" fill="#64748B" />
          {/* Trackpad */}
          <rect x="42" y="62" width="16" height="3" rx="1" fill="#475569" />
        </g>

        {/* Floating Interactive 3D Keycaps */}
        {/* Keycap 'W' */}
        <g transform="translate(100, 75)" filter="url(#heroDropShadow)">
          <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#heroKeyGrad)" stroke="#C9E5FF" strokeWidth="1.5" />
          <rect x="0" y="26" width="32" height="6" rx="3" fill="#C9E5FF" />
          <text x="16" y="21" textAnchor="middle" fontFamily="monospace" fontWeight="800" fontSize="14" fill="#168BFF">
            W
          </text>
        </g>

        {/* Keycap 'P' */}
        <g transform="translate(325, 60)" filter="url(#heroDropShadow)">
          <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#heroKeyGrad)" stroke="#C9E5FF" strokeWidth="1.5" />
          <rect x="0" y="26" width="32" height="6" rx="3" fill="#C9E5FF" />
          <text x="16" y="21" textAnchor="middle" fontFamily="monospace" fontWeight="800" fontSize="14" fill="#8057E8">
            P
          </text>
        </g>

        {/* Keycap 'M' */}
        <g transform="translate(365, 115)" filter="url(#heroDropShadow)">
          <rect x="0" y="0" width="30" height="30" rx="7" fill="url(#heroKeyGrad)" stroke="#C9E5FF" strokeWidth="1.5" />
          <rect x="0" y="24" width="30" height="6" rx="3" fill="#C9E5FF" />
          <text x="15" y="20" textAnchor="middle" fontFamily="monospace" fontWeight="800" fontSize="13" fill="#10B981">
            M
          </text>
        </g>

        {/* Floating Telemetry Chip 1: Speed Badge (Top Left) */}
        <g transform="translate(48, 128)" filter="url(#heroCardShadow)">
          <rect x="0" y="0" width="86" height="28" rx="14" fill="#FFFFFF" stroke="#C9E5FF" strokeWidth="1.2" />
          <circle cx="14" cy="14" r="8" fill="#EAF5FF" />
          <path d="M14 9 L11 15 L15 15 L13 19 L17 13 L13 13 Z" fill="#168BFF" />
          <text x="28" y="18" fontFamily="sans-serif" fontWeight="800" fontSize="11" fill="#15213A">
            124 <tspan fontSize="9" fontWeight="600" fill="#168BFF">WPM</tspan>
          </text>
        </g>

        {/* Floating Telemetry Chip 2: Accuracy Badge (Top Right) */}
        <g transform="translate(320, 20)" filter="url(#heroCardShadow)">
          <rect x="0" y="0" width="88" height="28" rx="14" fill="#FFFFFF" stroke="#C9E5FF" strokeWidth="1.2" />
          <circle cx="14" cy="14" r="8" fill="#E8FAF2" />
          <circle cx="14" cy="14" r="5" stroke="#10B981" strokeWidth="1.2" fill="none" />
          <circle cx="14" cy="14" r="2" fill="#10B981" />
          <text x="28" y="18" fontFamily="sans-serif" fontWeight="800" fontSize="11" fill="#15213A">
            99.8% <tspan fontSize="8" fontWeight="600" fill="#10B981">Acc</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
};
