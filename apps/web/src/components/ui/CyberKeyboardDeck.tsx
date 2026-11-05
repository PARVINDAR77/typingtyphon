'use client';

import React from 'react';

interface CyberKeyboardDeckProps {
  activeChar?: string;
  highlightedKeys?: string[];
  className?: string;
}

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
];

export const CyberKeyboardDeck: React.FC<CyberKeyboardDeckProps> = ({
  activeChar = '',
  highlightedKeys = ['a', 'g'],
  className = '',
}) => {
  const normActive = activeChar.toLowerCase();
  const normHighlighted = highlightedKeys.map((k) => k.toLowerCase());

  const getKeyWidth = (key: string): string => {
    switch (key) {
      case 'Backspace':
        return '48px';
      case 'Tab':
        return '44px';
      case '\\':
        return '40px';
      case 'Caps':
        return '48px';
      case 'Enter':
        return '56px';
      case 'Shift':
        return '60px';
      default:
        return '34px';
    }
  };

  const isKeyActive = (key: string): boolean => {
    const k = key.toLowerCase();
    if (k === normActive) return true;
    if (normHighlighted.includes(k)) return true;
    return false;
  };

  const isHomeRowAnchor = (key: string): boolean => {
    return key === 'F' || key === 'J';
  };

  return (
    <div
      className={`cyber-keyboard-deck ${className}`}
      style={{
        padding: '0.85rem',
        borderRadius: '16px',
        background: 'rgba(10, 20, 40, 0.75)',
        border: '1px solid rgba(120, 160, 255, 0.2)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        userSelect: 'none',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        maxWidth: '560px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div
          key={rIdx}
          style={{
            display: 'flex',
            gap: '0.3rem',
            justifyContent: 'center',
          }}
        >
          {row.map((key, kIdx) => {
            const active = isKeyActive(key);
            const isPurple = key.toLowerCase() === 'a' || key.toLowerCase() === 'f';
            const isCyan = key.toLowerCase() === 'g' || key.toLowerCase() === 'j';

            let bg = 'rgba(16, 29, 54, 0.8)';
            let border = 'rgba(120, 160, 255, 0.16)';
            let color = '#A3B2CC';
            let boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

            if (active) {
              if (isPurple) {
                bg = 'linear-gradient(135deg, #8257FF 0%, #5B21B6 100%)';
                border = '#8257FF';
                color = '#FFFFFF';
                boxShadow = '0 0 15px rgba(130, 87, 255, 0.6)';
              } else if (isCyan) {
                bg = 'linear-gradient(135deg, #00D9FF 0%, #0284C7 100%)';
                border = '#00D9FF';
                color = '#050B18';
                boxShadow = '0 0 15px rgba(0, 217, 255, 0.6)';
              } else {
                bg = 'linear-gradient(135deg, #168BFF 0%, #0284C7 100%)';
                border = '#168BFF';
                color = '#FFFFFF';
                boxShadow = '0 0 12px rgba(22, 139, 255, 0.5)';
              }
            }

            return (
              <div
                key={kIdx}
                style={{
                  minWidth: getKeyWidth(key),
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: bg,
                  border: `1px solid ${border}`,
                  color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: key.length > 1 ? '0.65rem' : '0.78rem',
                  fontWeight: 700,
                  boxShadow,
                  transition: 'all 0.12s ease',
                  position: 'relative',
                }}
              >
                {key}
                {isHomeRowAnchor(key) && !active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      width: '8px',
                      height: '2px',
                      borderRadius: '1px',
                      background: 'rgba(255, 255, 255, 0.4)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

