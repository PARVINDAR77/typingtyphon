'use client';

import React, { useRef, useEffect } from 'react';
import { RaceCharState } from '../../engine/RaceEngine';

interface RaceTypingBoxProps {
  charStates: RaceCharState[];
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  status: 'waiting' | 'countdown' | 'racing' | 'finished';
  countdownSeconds: number;
  source?: string;
  zoomLevel?: number;
}

export const RaceTypingBox: React.FC<RaceTypingBoxProps> = ({
  charStates,
  activeIndex,
  onKeyDown,
  status,
  countdownSeconds,
  source,
  zoomLevel = 100,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when race starts or countdown begins
  useEffect(() => {
    if (status === 'racing' || status === 'countdown') {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleBoxClick = () => {
    inputRef.current?.focus();
  };

  const fontSize = `${(1.42 * (zoomLevel / 100)).toFixed(2)}rem`;
  const lineHeight = `${(2.45 * (zoomLevel / 100)).toFixed(2)}rem`;

  return (
    <div
      onClick={handleBoxClick}
      tabIndex={0}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '140px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.25rem 1.75rem',
        boxShadow: 'var(--shadow-card)',
        cursor: 'text',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Hidden input to capture physical keystrokes */}
      <input
        id="multiplayer-race-input"
        ref={inputRef}
        type="text"
        autoFocus
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={onKeyDown}
        style={{
          position: 'absolute',
          opacity: 0,
          left: 0,
          top: 0,
          width: '1px',
          height: '1px',
          pointerEvents: 'none',
        }}
      />

      {/* Countdown Overlay Banner (5, 4, 3, 2, 1, GO!) */}
      {status === 'countdown' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(8px)',
            borderRadius: '1rem',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Get Ready To Race
          </span>
          <div
            style={{
              fontSize: countdownSeconds > 0 ? '3.5rem' : '3.0rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: countdownSeconds === 0 ? '#10b981' : 'var(--brand-primary)',
              textShadow: countdownSeconds === 0 ? '0 0 25px rgba(16, 185, 129, 0.4)' : '0 0 20px rgba(56, 189, 248, 0.4)',
              transform: 'scale(1)',
              transition: 'transform 0.15s ease',
            }}
          >
            {countdownSeconds > 0 ? countdownSeconds : 'GO!'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Start typing the passage as fast and cleanly as you can!
          </span>
        </div>
      )}

      {/* Passage Text Rendering */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize,
          lineHeight,
          letterSpacing: '0.025em',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {charStates.map((item, idx) => {
          const isCurrent = idx === activeIndex && status === 'racing';
          const isSpace = item.char === ' ';

          let color = 'var(--char-untouched)'; // untouched
          let bg = 'transparent';
          let borderBottom = 'none';

          if (item.state === 'correct') {
            color = 'var(--char-correct)';
          } else if (item.state === 'incorrect') {
            color = 'var(--char-incorrect)';
            bg = 'var(--char-incorrect-bg)';
            borderBottom = '2px solid var(--char-incorrect)';
          }

          if (isCurrent) {
            bg = 'var(--char-active-bg)';
          }

          return (
            <span
              key={idx}
              style={{
                position: 'relative',
                color,
                backgroundColor: bg,
                borderBottom,
                borderRadius: '2px',
                padding: '0 1px',
                transition: 'color 0.04s ease',
              }}
            >
              {/* Caret cursor at current position */}
              {isCurrent && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0.15em',
                    left: 0,
                    width: '2.5px',
                    height: '1.25em',
                    backgroundColor: '#38bdf8',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px #38bdf8, 0 0 14px rgba(56, 189, 248, 0.5)',
                    pointerEvents: 'none',
                  }}
                />
              )}
              {/* Space as middle dot (·) */}
              {isSpace ? (
                <span style={{ opacity: item.state === 'untouched' ? 0.35 : 0.7 }}>·</span>
              ) : (
                item.char
              )}
            </span>
          );
        })}
      </div>

      {/* Quote Source Attribution */}
      {source && (
        <div
          style={{
            marginTop: '0.75rem',
            textAlign: 'right',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
          }}
        >
          — {source}
        </div>
      )}
    </div>
  );
};
