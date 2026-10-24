'use client';

import React, { useMemo } from 'react';
import {
  FINGER_DATA,
  FingerId,
  getKeyReach,
} from '../lib/fingerMapping';

export type SkinToneId = 'warm' | 'fair' | 'deep' | 'light' | 'cyber';

export interface SkinToneConfig {
  id: SkinToneId;
  name: string;
  emoji: string;
  filterStyle: string;
}

export const SKIN_TONES: Record<SkinToneId, SkinToneConfig> = {
  warm: {
    id: 'warm',
    name: 'Natural Warm',
    emoji: '🖐🏽',
    filterStyle: 'none',
  },
  fair: {
    id: 'fair',
    name: 'Fair Peach',
    emoji: '🖐🏼',
    filterStyle: 'brightness(1.08) saturate(0.92) sepia(0.08)',
  },
  deep: {
    id: 'deep',
    name: 'Rich Bronze',
    emoji: '🖐🏾',
    filterStyle: 'brightness(0.72) contrast(1.15) sepia(0.28) saturate(1.1)',
  },
  light: {
    id: 'light',
    name: 'Alabaster Light',
    emoji: '🖐🏻',
    filterStyle: 'brightness(1.16) saturate(0.85)',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Titanium',
    emoji: '🤖',
    filterStyle: 'hue-rotate(185deg) invert(0.82) contrast(1.25) saturate(1.4)',
  },
};

interface RealisticHandProps {
  side: 'left' | 'right';
  activeFingerId: FingerId | null;
  activeChar?: string;
  skinTone?: SkinToneId;
  opacity?: number;
  width?: number | string;
  height?: number | string;
  hideLegend?: boolean;
  onSelectKey?: (key: string) => void;
}

const RealisticHandComponent: React.FC<RealisticHandProps> = ({
  side,
  activeFingerId,
  activeChar,
  skinTone = 'warm',
  opacity = 1,
  width = '440px',
  height = '440px',
  hideLegend = false,
  onSelectKey,
}) => {
  const tone = SKIN_TONES[skinTone] || SKIN_TONES.warm;
  const isLeft = side === 'left';
  const reachInfo = activeChar ? getKeyReach(activeChar) : null;

  // Real Photographic Human Hand Assets (High-Res Transparent WebP)
  const palmSrc = isLeft ? '/hands/left-palm.webp' : '/hands/right-palm.webp';

  // Base 1024x1024 anatomical coordinates of fingertips & knuckle pivots
  const fingers = useMemo(() => {
    if (isLeft) {
      return [
        {
          id: 'left-pinky' as FingerId,
          name: 'Pinky',
          homeKey: 'a',
          defaultLabel: 'A',
          hasNub: false,
          homeX: 266,
          homeY: 258,
          knuckleX: 310,
          knuckleY: 480,
          imageSrc: '/hands/left-pinky.webp',
        },
        {
          id: 'left-ring' as FingerId,
          name: 'Ring',
          homeKey: 's',
          defaultLabel: 'S',
          hasNub: false,
          homeX: 393,
          homeY: 139,
          knuckleX: 406,
          knuckleY: 435,
          imageSrc: '/hands/left-ring.webp',
        },
        {
          id: 'left-middle' as FingerId,
          name: 'Middle',
          homeKey: 'd',
          defaultLabel: 'D',
          hasNub: false,
          homeX: 503,
          homeY: 101,
          knuckleX: 511,
          knuckleY: 415,
          imageSrc: '/hands/left-middle.webp',
        },
        {
          id: 'left-index' as FingerId,
          name: 'Index',
          homeKey: 'f',
          defaultLabel: 'F',
          hasNub: true,
          homeX: 638,
          homeY: 141,
          knuckleX: 617,
          knuckleY: 430,
          imageSrc: '/hands/left-index.webp',
        },
        {
          id: 'thumb' as FingerId,
          name: 'Thumb',
          homeKey: ' ',
          defaultLabel: 'SPACE',
          hasNub: false,
          homeX: 813,
          homeY: 379,
          knuckleX: 710,
          knuckleY: 560,
          imageSrc: '/hands/left-thumb.webp',
        },
      ];
    } else {
      return [
        {
          id: 'thumb' as FingerId,
          name: 'Thumb',
          homeKey: ' ',
          defaultLabel: 'SPACE',
          hasNub: false,
          homeX: 226,
          homeY: 386,
          knuckleX: 320,
          knuckleY: 560,
          imageSrc: '/hands/right-thumb.webp',
        },
        {
          id: 'right-index' as FingerId,
          name: 'Index',
          homeKey: 'j',
          defaultLabel: 'J',
          hasNub: true,
          homeX: 378,
          homeY: 121,
          knuckleX: 418,
          knuckleY: 420,
          imageSrc: '/hands/right-index.webp',
        },
        {
          id: 'right-middle' as FingerId,
          name: 'Middle',
          homeKey: 'k',
          defaultLabel: 'K',
          hasNub: false,
          homeX: 517,
          homeY: 80,
          knuckleX: 530,
          knuckleY: 410,
          imageSrc: '/hands/right-middle.webp',
        },
        {
          id: 'right-ring' as FingerId,
          name: 'Ring',
          homeKey: 'l',
          defaultLabel: 'L',
          hasNub: false,
          homeX: 622,
          homeY: 128,
          knuckleX: 634,
          knuckleY: 420,
          imageSrc: '/hands/right-ring.webp',
        },
        {
          id: 'right-pinky' as FingerId,
          name: 'Pinky',
          homeKey: ';',
          defaultLabel: ';',
          hasNub: false,
          homeX: 767,
          homeY: 229,
          knuckleX: 725,
          knuckleY: 470,
          imageSrc: '/hands/right-pinky.webp',
        },
      ];
    }
  }, [isLeft]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem',
        opacity: opacity,
        transition: 'opacity 0.2s ease',
        userSelect: 'none',
      }}
    >
      {/* Hand Container: Anchored firmly over keyboard home row (ASDF / JKL;) */}
      <div
        style={{
          position: 'relative',
          width: width,
          height: height,
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          filter: tone.filterStyle !== 'none'
            ? `${tone.filterStyle} drop-shadow(0 14px 28px rgba(0, 0, 0, 0.65))`
            : 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.65))',
        }}
      >
        {/* Soft Ambient Depth Shadow beneath hand */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '75%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(14px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* 1. STATIONARY PHOTOREALISTIC PALM & WRIST BASE (Never slides across keys) */}
        <img
          src={palmSrc}
          alt={isLeft ? 'Photorealistic Left Palm' : 'Photorealistic Right Palm'}
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 3,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* 2. FIVE INDEPENDENTLY ARTICULATING PHOTOREALISTIC FINGERS */}
        {fingers.map((fItem) => {
          const isAct = activeFingerId === fItem.id;
          let fingerTransform = 'translate(0px, 0px) rotate(0deg) scale(1)';
          const zIndex = isAct ? 5 : 2;

          if (isAct) {
            if (fItem.id === 'thumb') {
              // Tactile Thumb Stroke on Spacebar
              fingerTransform = `translate(0px, 14px) rotate(${isLeft ? 3.5 : -3.5}deg) scale(0.98)`;
            } else if (reachInfo && reachInfo.fingerId === fItem.id && (reachInfo.dx !== 0 || reachInfo.dy !== 0)) {
              // Dynamic reach vector: rotate and extend/curl directly to target keycap
              const targetX = fItem.homeX + reachInfo.dx;
              const targetY = fItem.homeY + reachInfo.dy;
              const vHome = { x: fItem.homeX - fItem.knuckleX, y: fItem.homeY - fItem.knuckleY };
              const vTarget = { x: targetX - fItem.knuckleX, y: targetY - fItem.knuckleY };

              const angleHome = Math.atan2(vHome.y, vHome.x) * (180 / Math.PI);
              const angleTarget = Math.atan2(vTarget.y, vTarget.x) * (180 / Math.PI);
              const deltaAngle = Number((angleTarget - angleHome).toFixed(2));

              const distHome = Math.hypot(vHome.x, vHome.y);
              const distTarget = Math.hypot(vTarget.x, vTarget.y);
              const scale = Number((distTarget / distHome).toFixed(3));

              fingerTransform = `rotate(${deltaAngle}deg) scale(${scale})`;
            } else {
              // Tactile bottom-out stroke directly on home row key
              fingerTransform = 'translate(0px, 9px) scale(0.96)';
            }
          }

          const originStyle = `${((fItem.knuckleX / 1024) * 100).toFixed(2)}% ${((fItem.knuckleY / 1024) * 100).toFixed(2)}%`;

          return (
            <img
              key={fItem.id}
              src={fItem.imageSrc}
              alt={fItem.name}
              loading="eager"
              decoding="async"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transformOrigin: originStyle,
                transform: `${fingerTransform} translateZ(0)`,
                willChange: 'transform',
                transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.25, 1.25)',
                zIndex: zIndex,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* 2. DYNAMIC FINGER REACH & STRIKE HUD LAYER (Aligned with 1024x1024 Hand Coordinates) */}
        <svg
          viewBox="0 0 1024 1024"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            pointerEvents: hideLegend ? 'none' : 'auto',
            zIndex: 4,
          }}
        >
          <style>
            {`
              @keyframes pulseRadarWave {
                0% { r: 38px; opacity: 0.95; }
                50% { r: 76px; opacity: 0.2; }
                100% { r: 38px; opacity: 0.95; }
              }
              @keyframes pulseRadarThumb {
                0% { r: 46px; opacity: 0.95; }
                50% { r: 88px; opacity: 0.2; }
                100% { r: 46px; opacity: 0.95; }
              }
            `}
          </style>

          <defs>
            {/* Active Finger Halos */}
            {Object.values(FINGER_DATA).map((f) => (
              <radialGradient key={`halo-${f.id}`} id={`halo-${f.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={f.color} stopOpacity="0.95" />
                <stop offset="40%" stopColor={f.color} stopOpacity="0.6" />
                <stop offset="85%" stopColor={f.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={f.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Render Fingertip Hotspots & Dynamic Reach Vectors */}
          {fingers.map((fItem) => {
            const isAct = activeFingerId === fItem.id;
            const fingerData = FINGER_DATA[fItem.id] || FINGER_DATA.thumb;
            const isThumb = fItem.id === 'thumb';

            // Check if this finger is reaching to a non-home key
            const hasReach = isAct && reachInfo && reachInfo.fingerId === fItem.id;

            // Target coordinate on keyboard: home coordinate + reach offset
            const targetX = hasReach ? fItem.homeX + reachInfo.dx : fItem.homeX;
            const targetY = hasReach ? fItem.homeY + reachInfo.dy : fItem.homeY;
            const displayChar = hasReach ? reachInfo.label : fItem.defaultLabel;

            return (
              <g
                key={fItem.id}
                onClick={() => onSelectKey?.(hasReach ? activeChar! : fItem.homeKey)}
                style={{
                  cursor: hideLegend ? 'default' : 'pointer',
                  pointerEvents: hideLegend ? 'none' : 'auto',
                }}
              >
                {/* Dynamic Reach Motion Trail (Dashed Line from Home to Target) */}
                {hasReach && (reachInfo.dx !== 0 || reachInfo.dy !== 0) && (
                  <g opacity="0.9">
                    {/* Motion vector line */}
                    <line
                      x1={fItem.homeX}
                      y1={fItem.homeY}
                      x2={targetX}
                      y2={targetY}
                      stroke={fingerData.color}
                      strokeWidth="5"
                      strokeDasharray="10 6"
                      strokeLinecap="round"
                      style={{ transition: 'all 0.16s ease' }}
                    />
                    {/* Home anchor resting ring */}
                    <circle
                      cx={fItem.homeX}
                      cy={fItem.homeY}
                      r="22"
                      fill="none"
                      stroke={fingerData.color}
                      strokeWidth="3.5"
                      opacity="0.6"
                    />
                    <text
                      x={fItem.homeX}
                      y={fItem.homeY + 7}
                      textAnchor="middle"
                      fill={fingerData.color}
                      fontSize="18"
                      fontWeight="900"
                      fontFamily="var(--font-mono)"
                      opacity="0.75"
                    >
                      {fItem.defaultLabel}
                    </text>
                  </g>
                )}

                {/* Active Strike Radiant Glow Halo */}
                {isAct && (
                  <>
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r={isThumb ? 84 : 70}
                      fill={`url(#halo-${fingerData.id})`}
                      style={{ transition: 'cx 0.16s ease, cy 0.16s ease' }}
                    />
                    {/* Pulsing Radar Strike Wave */}
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r={isThumb ? 46 : 38}
                      fill="none"
                      stroke={fingerData.color}
                      strokeWidth="5.5"
                      style={{
                        animation: isThumb
                          ? 'pulseRadarThumb 1.2s infinite ease-in-out'
                          : 'pulseRadarWave 1.2s infinite ease-in-out',
                        transition: 'cx 0.16s ease, cy 0.16s ease',
                      }}
                    />
                  </>
                )}

                {/* Fingertip Target Keycap Badge */}
                {isThumb ? (
                  /* Spacebar Thumb Pill Badge */
                  <g
                    transform={`translate(${targetX}, ${targetY + 4})`}
                    style={{ transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.25, 1.25)' }}
                  >
                    <rect
                      x="-54"
                      y="-22"
                      width="108"
                      height="44"
                      rx="22"
                      fill={isAct ? fingerData.color : 'rgba(8, 14, 30, 0.94)'}
                      stroke={isAct ? '#ffffff' : fingerData.color}
                      strokeWidth={isAct ? 4.5 : 2.5}
                      filter={isAct ? `drop-shadow(0 0 20px ${fingerData.color})` : 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))'}
                    />
                    <text
                      x="0"
                      y="8"
                      textAnchor="middle"
                      fill={isAct ? '#070d1e' : '#ffffff'}
                      fontSize="19"
                      fontWeight="900"
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.05em"
                    >
                      SPACE
                    </text>
                  </g>
                ) : (
                  /* Standard Finger Circular Badge with Tactile Homing Nub on F & J */
                  <g
                    transform={`translate(${targetX}, ${targetY + 5})`}
                    style={{ transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.25, 1.25)' }}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={isAct ? 28 : 23}
                      fill={isAct ? fingerData.color : 'rgba(8, 14, 30, 0.94)'}
                      stroke={isAct ? '#ffffff' : fingerData.color}
                      strokeWidth={isAct ? 4.5 : 2.5}
                      filter={isAct ? `drop-shadow(0 0 20px ${fingerData.color})` : 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))'}
                    />
                    <text
                      x="0"
                      y={displayChar.length > 1 ? 6 : 8}
                      textAnchor="middle"
                      fill={isAct ? '#070d1e' : '#ffffff'}
                      fontSize={displayChar.length > 1 ? 16 : 22}
                      fontWeight="900"
                      fontFamily="var(--font-mono)"
                    >
                      {displayChar}
                    </text>

                    {/* Raised Tactile Homing Nub on F & J (only when on home row) */}
                    {fItem.hasNub && !hasReach && (
                      <rect
                        x="-10"
                        y="14"
                        width="20"
                        height="4.5"
                        rx="2.2"
                        fill={isAct ? '#070d1e' : '#f59e0b'}
                        filter={isAct ? 'none' : 'drop-shadow(0 0 4px #f59e0b)'}
                      />
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Modern Finger Color-Coded Chips Legend (Desk Station View) */}
      {!hideLegend && (
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            fontSize: '0.72rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {fingers
            .filter((f) => f.id !== 'thumb')
            .map((f) => {
              const data = FINGER_DATA[f.id];
              const isAct = activeFingerId === f.id;
              return (
                <span
                  key={f.id}
                  onClick={() => onSelectKey?.(f.homeKey)}
                  style={{
                    color: isAct ? '#ffffff' : data.color,
                    fontWeight: isAct ? 800 : 700,
                    cursor: 'pointer',
                    background: isAct ? `${data.color}33` : 'var(--bg-surface-subtle)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    border: isAct ? `1.5px solid ${data.color}` : '1px solid var(--border-subtle)',
                    boxShadow: isAct ? `0 0 10px ${data.color}55` : 'none',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {f.name} ({f.defaultLabel})
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
};

export const RealisticHand = React.memo(RealisticHandComponent);
