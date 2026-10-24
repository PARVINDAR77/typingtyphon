'use client';

import React, { useState, useMemo } from 'react';
import {
  FINGER_DATA,
  KEYBOARD_LAYOUT_ROWS,
  getFingerForKey,
  getKeyReach,
  FingerId,
} from '../lib/fingerMapping';
import { RealisticHand, SkinToneId, SKIN_TONES } from './RealisticHand';

interface FingerGuideProps {
  activeChar?: string;
  isDrill?: boolean;
  onSelectKeyToPractice?: (key: string) => void;
}

export const FingerGuide: React.FC<FingerGuideProps> = ({
  activeChar,
  isDrill = false,
  onSelectKeyToPractice,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeRowTab, setActiveRowTab] = useState<'all' | 'home' | 'top' | 'bottom' | 'numbers'>('all');
  const [skinTone, setSkinTone] = useState<SkinToneId>('warm');
  const [keyboardTheme, setKeyboardTheme] = useState<'vibrant' | 'rgb'>('vibrant');
  const [handViewMode, setHandViewMode] = useState<'on-keyboard' | 'desk'>('on-keyboard');
  const [handOpacity, setHandOpacity] = useState<number>(0.88);

  // If user typed in active speed test, sync selectedKey with live typing flow
  React.useEffect(() => {
    if (activeChar) {
      setSelectedKey(null);
    }
  }, [activeChar]);

  // Listen to physical keyboard presses anywhere on the page for instant live finger kinematics
  React.useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.id !== 'canvas-hidden-input') {
        return;
      }
      const k = e.key;
      if (k.length === 1 || k === ' ' || k === 'Backspace') {
        setSelectedKey(k === ' ' ? ' ' : k.toLowerCase());
      }
    };
    window.addEventListener('keydown', handlePhysicalKeyDown);
    return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
  }, []);

  // Priority: selectedKey (user click or physical press) takes immediate precedence over idle activeChar
  const inspectedChar = selectedKey || activeChar || 'f';
  const activeFinger = useMemo(() => getFingerForKey(inspectedChar), [inspectedChar]);
  const activeReach = useMemo(() => getKeyReach(inspectedChar), [inspectedChar]);

  // Normalize key for matching against keyboard caps
  const normalizedInspected = inspectedChar.length === 1 ? inspectedChar.toLowerCase() : inspectedChar;

  // Reach direction text for user feedback
  const reachDescription = useMemo(() => {
    if (!activeReach) return 'Resting on Home Row';
    const { dx, dy, label } = activeReach;
    if (dx === 0 && dy === 0) return `Home Row Anchor: ${label}`;
    let dir = '';
    if (dy < -60) dir += 'Reach Up-High';
    else if (dy < 0) dir += 'Reach Up';
    else if (dy > 0) dir += 'Curl Down';
    
    if (dx > 20) dir += ' Right';
    else if (dx < -20) dir += ' Left';
    return `${dir} to ${label}`;
  }, [activeReach]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem',
        padding: '1.65rem 1.85rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #8b5cf6, #38bdf8, transparent)' }} />
      {/* ================================================================ */}
      {/* 1. HEADER & CONTROLS: TARGET BANNER + VIEW MODE + SKIN TONES     */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
        }}
      >
        {/* Top Header Row: Title & Active Strike Target */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 0 14px rgba(56, 189, 248, 0.25)',
              }}
            >
              ⌨️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Interactive Mechanical Keyboard & Hands Kinematics
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: handViewMode === 'on-keyboard' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                    color: handViewMode === 'on-keyboard' ? '#38bdf8' : '#10b981',
                    border: `1px solid ${handViewMode === 'on-keyboard' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                    padding: '0.12rem 0.5rem',
                    borderRadius: '9999px',
                  }}
                >
                  {handViewMode === 'on-keyboard' ? 'Hands on Keyboard' : 'Desk Station'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Real hands touch-typing directly over the keys: dynamic reaching, mechanical key bottoming-out, and muscle memory
              </p>
            </div>
          </div>

          {/* Active Finger Target Badge */}
          {activeFinger && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: activeFinger.badgeBg,
                border: `1.5px solid ${activeFinger.color}`,
                borderRadius: '9999px',
                padding: '0.35rem 1.15rem',
                boxShadow: `0 0 16px ${activeFinger.color}44`,
              }}
            >
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Target:
              </span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  color: '#070d1e',
                  background: activeFinger.color,
                  padding: '0.15rem 0.6rem',
                  borderRadius: '6px',
                  boxShadow: `0 0 12px ${activeFinger.color}`,
                }}
              >
                {inspectedChar === ' ' ? 'SPACE' : inspectedChar.toUpperCase()}
              </kbd>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeFinger.color }}>
                {activeFinger.name} • {reachDescription}
              </span>
            </div>
          )}
        </div>

        {/* Sub Controls Row: View Mode Switcher, Hand Opacity, Skin Tones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.4rem 0.85rem',
          }}
        >
          {/* Hand View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Hands Position:
            </span>
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setHandViewMode('on-keyboard')}
                style={{
                  background: handViewMode === 'on-keyboard' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: handViewMode === 'on-keyboard' ? '#0284c7' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                ⌨️ On Keyboard Keys
              </button>
              <button
                type="button"
                onClick={() => setHandViewMode('desk')}
                style={{
                  background: handViewMode === 'desk' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: handViewMode === 'desk' ? '#7c3aed' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                🖥️ Desk Station Above
              </button>
            </div>
          </div>

          {/* Hand Translucency Control */}
          {handViewMode === 'on-keyboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Hand Opacity:
              </span>
              {[
                { label: '88% Glass', val: 0.88 },
                { label: '100% Solid', val: 1.0 },
                { label: '65% Ghost', val: 0.65 },
              ].map((op) => (
                <button
                  key={op.val}
                  type="button"
                  onClick={() => setHandOpacity(op.val)}
                  style={{
                    background: handOpacity === op.val ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-card)',
                    color: handOpacity === op.val ? '#0284c7' : 'var(--text-muted)',
                    border: handOpacity === op.val ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '0.15rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}

          {/* Skin Tone Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Tone:
            </span>
            {(Object.keys(SKIN_TONES) as SkinToneId[]).map((tKey) => {
              const item = SKIN_TONES[tKey];
              const isSelected = skinTone === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  title={`${item.name} Tone`}
                  onClick={() => setSkinTone(tKey)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-card)',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid var(--border-subtle)',
                    borderRadius: '9999px',
                    padding: '0.15rem 0.45rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 500,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span>{item.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. OPTIONAL DESK VIEW (IF 'desk' VIEW MODE SELECTED)             */}
      {/* ================================================================ */}
      {handViewMode === 'desk' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            alignItems: 'center',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Left Hand Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Left Hand
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• Resting: A S D F</span>
            </div>

            <RealisticHand
              side="left"
              activeFingerId={activeFinger?.id || null}
              activeChar={inspectedChar}
              skinTone={skinTone}
              onSelectKey={(k) => {
                setSelectedKey(k);
                if (onSelectKeyToPractice) onSelectKeyToPractice(k);
              }}
            />
          </div>

          {/* Center Reach HUD */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem',
              minWidth: '130px',
            }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Action
            </span>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: activeFinger ? activeFinger.color : '#38bdf8',
                color: '#070d1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                boxShadow: activeFinger ? `0 0 20px ${activeFinger.color}66` : 'none',
                transform: 'scale(1.05)',
                transition: 'all 0.12s ease',
              }}
            >
              {inspectedChar === ' ' ? '⎵' : inspectedChar.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: activeFinger?.color || 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>
              {reachDescription}
            </span>
          </div>

          {/* Right Hand Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Right Hand
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• Resting: J K L ;</span>
            </div>

            <RealisticHand
              side="right"
              activeFingerId={activeFinger?.id || null}
              activeChar={inspectedChar}
              skinTone={skinTone}
              onSelectKey={(k) => {
                setSelectedKey(k);
                if (onSelectKeyToPractice) onSelectKeyToPractice(k);
              }}
            />
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 3. KEYBOARD TOOLBAR: ROW TABS + COLOR THEME + FINGER LEGEND      */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        {/* Row Guidance Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All 5 Rows' },
            { id: 'home', label: 'Home Row (ASDF JKL;)' },
            { id: 'top', label: 'Top Row (QWERTY)' },
            { id: 'bottom', label: 'Bottom Row (ZXCVBNM)' },
            { id: 'numbers', label: 'Numbers (12345 67890)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRowTab(tab.id as any)}
              style={{
                background: activeRowTab === tab.id ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: activeRowTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: activeRowTab === tab.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                borderRadius: '7px',
                padding: '0.32rem 0.75rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Color Theme Selector & Finger Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Keycap Color Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setKeyboardTheme('vibrant')}
              style={{
                background: keyboardTheme === 'vibrant' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                color: keyboardTheme === 'vibrant' ? '#0284c7' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              🎨 Vibrant GMK
            </button>
            <button
              type="button"
              onClick={() => setKeyboardTheme('rgb')}
              style={{
                background: keyboardTheme === 'rgb' ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                color: keyboardTheme === 'rgb' ? '#7c3aed' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              💡 RGB Backlit
            </button>
          </div>

          {/* Color Zone Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA['left-pinky'].color, boxShadow: `0 0 6px ${FINGER_DATA['left-pinky'].color}` }} /> Pinky
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA['left-ring'].color, boxShadow: `0 0 6px ${FINGER_DATA['left-ring'].color}` }} /> Ring
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA['left-middle'].color, boxShadow: `0 0 6px ${FINGER_DATA['left-middle'].color}` }} /> Middle
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA['left-index'].color, boxShadow: `0 0 6px ${FINGER_DATA['left-index'].color}` }} /> Left Index
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA['right-index'].color, boxShadow: `0 0 6px ${FINGER_DATA['right-index'].color}` }} /> Right Index
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: FINGER_DATA.thumb.color, boxShadow: `0 0 6px ${FINGER_DATA.thumb.color}` }} /> Space
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 4. ON-SCREEN MECHANICAL KEYBOARD (WITH HANDS OVERLAY INTEGRATION)*/}
      {/* ================================================================ */}
      <div
        style={{
          position: 'relative',
          padding: '1.25rem',
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.1rem',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          minHeight: '275px',
        }}
      >
        {/* KEYBOARD KEYCAP GRID */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'clamp(3px, 0.45vw, 6px)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {KEYBOARD_LAYOUT_ROWS.map((row, rIdx) => {
            // Row filtering
            if (activeRowTab === 'numbers' && rIdx !== 0) return null;
            if (activeRowTab === 'top' && rIdx !== 1) return null;
            if (activeRowTab === 'home' && rIdx !== 2) return null;
            if (activeRowTab === 'bottom' && rIdx !== 3) return null;

            return (
              <div
                key={rIdx}
                style={{
                  display: 'flex',
                  gap: 'clamp(3px, 0.45vw, 6px)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {row.map((kItem) => {
                  const finger = FINGER_DATA[kItem.finger] || FINGER_DATA.thumb;
                  const isTarget =
                    normalizedInspected === kItem.key.toLowerCase() ||
                    (inspectedChar === ' ' && kItem.key === ' ');

                  // Keycap Color Styling based on mode
                  const keyBackground = isTarget
                    ? finger.color
                    : keyboardTheme === 'vibrant'
                    ? `linear-gradient(180deg, ${finger.color}44 0%, ${finger.color}20 100%)`
                    : 'var(--bg-card)';

                  const keyBorder = isTarget
                    ? '2px solid #ffffff'
                    : keyboardTheme === 'vibrant'
                    ? `1.5px solid ${finger.color}88`
                    : '1px solid var(--border-medium)';

                  const keyTextColor = isTarget
                    ? '#070d1e'
                    : keyboardTheme === 'vibrant'
                    ? 'var(--text-primary)'
                    : 'var(--text-primary)';

                  const keyBoxShadow = isTarget
                    ? `0 0 24px ${finger.color}, 0 0 48px ${finger.color}88, 0 1px 0 rgba(0, 0, 0, 0.4)`
                    : keyboardTheme === 'vibrant'
                    ? `0 4px 0 ${finger.color}35, 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.35)`
                    : '0 3px 0 var(--border-subtle), 0 2px 5px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)';

                  return (
                    <button
                      key={kItem.key}
                      type="button"
                      onClick={() => {
                        setSelectedKey(kItem.key);
                        if (onSelectKeyToPractice && kItem.key.length === 1) {
                          onSelectKeyToPractice(kItem.key);
                        }
                      }}
                      style={{
                        flex: `${kItem.width || 1} 1 0%`,
                        minWidth: 0,
                        height: 'clamp(40px, 4.2vw, 48px)',
                        borderRadius: '8px',
                        background: keyBackground,
                        border: keyBorder,
                        color: keyTextColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(0.72rem, 0.9vw, 0.85rem)',
                        fontWeight: isTarget || kItem.isHomeAnchor ? 900 : 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxSizing: 'border-box',
                        boxShadow: keyBoxShadow,
                        userSelect: 'none',
                        zIndex: 2,
                      }}
                    >
                      {/* Top Edge Color Accent Line */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '2px',
                          left: '6px',
                          right: '6px',
                          height: '1.5px',
                          borderRadius: '2px',
                          background: isTarget ? 'rgba(255, 255, 255, 0.9)' : `${finger.color}aa`,
                          boxShadow: `0 0 4px ${finger.color}`,
                        }}
                      />

                      {/* Keycap Character Label */}
                      <span style={{ marginTop: kItem.isHomeAnchor ? '0' : '2px' }}>
                        {kItem.display}
                      </span>

                      {/* Tactile Raised Nub for F and J Home Anchors */}
                      {kItem.isHomeAnchor && (
                        <span
                          style={{
                            width: '14px',
                            height: '2.5px',
                            borderRadius: '2px',
                            background: isTarget ? '#070d1e' : '#f59e0b',
                            marginTop: '2px',
                            boxShadow: isTarget ? 'none' : '0 0 8px #f59e0b',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* REALISTIC HANDS OVERLAY DIRECTLY ON KEYBOARD KEYS */}
          {handViewMode === 'on-keyboard' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'visible',
              }}
            >
              {/* Left Hand Overlay (Anchored directly over ASDF & Left Spacebar) */}
              <div
                style={{
                  position: 'absolute',
                  top: '55px',
                  left: '27%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  transition: 'left 0.15s ease',
                }}
              >
                <RealisticHand
                  side="left"
                  activeFingerId={activeFinger?.id || null}
                  activeChar={inspectedChar}
                  skinTone={skinTone}
                  opacity={handOpacity}
                  width="450px"
                  height="450px"
                  hideLegend={true}
                />
              </div>

              {/* Right Hand Overlay (Anchored directly over JKL; & Right Spacebar) */}
              <div
                style={{
                  position: 'absolute',
                  top: '55px',
                  left: '73%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  transition: 'left 0.15s ease',
                }}
              >
                <RealisticHand
                  side="right"
                  activeFingerId={activeFinger?.id || null}
                  activeChar={inspectedChar}
                  skinTone={skinTone}
                  opacity={handOpacity}
                  width="450px"
                  height="450px"
                  hideLegend={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* 5. ERGONOMIC TOUCH TYPING GOLDEN RULES                           */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          padding: '0.9rem 1.25rem',
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.85rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
          <span style={{ color: '#10b981', fontWeight: 900, fontSize: '0.95rem' }}>✓</span>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Hands on Keyboard:</strong> Fingers rest directly over <strong>A S D F</strong> (left) and <strong>J K L ;</strong> (right).
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
          <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '0.95rem' }}>✓</span>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>F & J Tactile Bumps:</strong> Feel for the raised tactile nubs on <strong>F</strong> and <strong>J</strong> to navigate without looking.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
          <span style={{ color: '#ec4899', fontWeight: 900, fontSize: '0.95rem' }}>✓</span>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Dynamic Reach & Return:</strong> Watch fingers reach to strike target keys, then immediately glide back to home row.
          </span>
        </div>
      </div>
    </div>
  );
};
