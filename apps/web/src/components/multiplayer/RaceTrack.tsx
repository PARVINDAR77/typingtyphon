'use client';

import React from 'react';
import { Racer, RaceGameMode } from '../../engine/RaceEngine';
import { VehicleSprite } from './VehicleSprites';

interface RaceTrackProps {
  racers: Racer[];
  mode: RaceGameMode;
  userWpm?: number;
}

const RANK_BADGES: Record<number, { text: string; bg: string; color: string; border: string }> = {
  1: { text: '1st', bg: 'rgba(234, 179, 8, 0.18)', color: '#eab308', border: 'rgba(234, 179, 8, 0.4)' },
  2: { text: '2nd', bg: 'rgba(148, 163, 184, 0.18)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' },
  3: { text: '3rd', bg: 'rgba(217, 119, 6, 0.18)', color: '#f59e0b', border: 'rgba(217, 119, 6, 0.4)' },
  4: { text: '4th', bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' },
};

export const RaceTrack: React.FC<RaceTrackProps> = ({ racers, mode, userWpm = 0 }) => {
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '0.65rem 0.85rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}
    >
      {racers.map((racer) => {
        const badge = RANK_BADGES[racer.rank] || RANK_BADGES[4];
        const isHighSpeed = racer.isUser && userWpm > 60;

        return (
          <div
            key={racer.id}
            style={{
              position: 'relative',
              width: '100%',
              height: '38px',
              background: racer.isUser
                ? 'rgba(14, 165, 233, 0.12)'
                : 'var(--bg-surface-subtle)',
              border: racer.isUser
                ? '1px solid rgba(56, 189, 248, 0.45)'
                : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 0.55rem',
              gap: '0.65rem',
              boxShadow: racer.isUser ? '0 0 14px rgba(14, 165, 233, 0.18)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Left Column: Racer Avatar & Name */}
            <div
              style={{
                width: '145px',
                minWidth: '145px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  background: `linear-gradient(135deg, ${racer.avatarColor}, #0f172a)`,
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  flexShrink: 0,
                }}
              >
                {racer.avatarInitials}
              </div>
              <span
                title={racer.name}
                style={{
                  fontWeight: racer.isUser ? 700 : 500,
                  color: racer.isUser ? '#38bdf8' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {racer.name}
              </span>
              {racer.isUser && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.08rem 0.35rem',
                    borderRadius: '9999px',
                    background: 'rgba(56, 189, 248, 0.25)',
                    color: '#38bdf8',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  YOU
                </span>
              )}
            </div>

            {/* Middle Column: Racing Track Roadway with Moving Vehicle */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                height: '28px',
                background:
                  mode === 'cyberdrift'
                    ? 'linear-gradient(90deg, #091124 0%, #0d172e 100%)'
                    : 'linear-gradient(90deg, #0b1329 0%, #0f1c3d 100%)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                padding: '0 0.25rem',
              }}
            >
              {/* Dashed Center Road Stripe */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: '24px',
                  height: '1px',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
                  pointerEvents: 'none',
                }}
              />

              {/* Checkered Finish Line */}
              <div
                title="Finish Line"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '20px',
                  background:
                    'repeating-conic-gradient(#ffffff 0% 25%, #0f172a 0% 50%) 50% / 8px 8px',
                  borderLeft: '2px solid #eab308',
                  opacity: 0.85,
                  zIndex: 2,
                }}
              />

              {/* Moving Vehicle along lane */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: '54px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(96, racer.progressPct)}%`,
                    transform: 'translateX(0)',
                    transition: 'left 0.12s cubic-bezier(0.2, 0, 0, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 3,
                  }}
                >
                  <VehicleSprite
                    mode={mode}
                    color={racer.vehicleColor}
                    width={44}
                    height={22}
                    isNitro={isHighSpeed}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Metrics (Position, Progress %, Speed, Errors) */}
            <div
              style={{
                width: '240px',
                minWidth: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                zIndex: 2,
              }}
            >
              {/* Position Rank Badge */}
              <span
                style={{
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                }}
              >
                {badge.text}
              </span>

              {/* Progress % */}
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{Math.round(racer.progressPct)}%</strong>
              </span>

              {/* Speed (WPM) */}
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                {racer.wpm} <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)' }}>WPM</span>
              </span>

              {/* Errors */}
              <span style={{ color: racer.errorCount > 0 ? '#f43f5e' : 'var(--text-muted)', fontWeight: 600 }}>
                {racer.errorCount} <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>err</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
