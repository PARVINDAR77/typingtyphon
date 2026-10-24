'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EngineResult } from '@typingtyphon/contracts';
import { KEYBOARD_LAYOUT_ROWS, KeyLayoutItem } from '../lib/fingerMapping';
import { getLastSessionWords } from '../lib/storage';

interface LiveResultsTypingDeckProps {
  result: EngineResult;
  sessionWords?: string[];
  onPracticeRestart?: () => void;
}

// Dual secondary labels for standard ANSI mechanical keycaps matching Keybr & Image 2
const DUAL_LABELS: Record<string, { top: string; bot: string }> = {
  '`': { top: '~', bot: '`' },
  '1': { top: '!', bot: '1' },
  '2': { top: '@', bot: '2' },
  '3': { top: '#', bot: '3' },
  '4': { top: '$', bot: '4' },
  '5': { top: '%', bot: '5' },
  '6': { top: '^', bot: '6' },
  '7': { top: '&', bot: '7' },
  '8': { top: '*', bot: '8' },
  '9': { top: '(', bot: '9' },
  '0': { top: ')', bot: '0' },
  '-': { top: '_', bot: '-' },
  '=': { top: '+', bot: '=' },
  '[': { top: '{', bot: '[' },
  ']': { top: '}', bot: ']' },
  '\\': { top: '|', bot: '\\' },
  ';': { top: ':', bot: ';' },
  "'": { top: '"', bot: "'" },
  ',': { top: '<', bot: ',' },
  '.': { top: '>', bot: '.' },
  '/': { top: '?', bot: '/' },
};

// Synthesized mechanical switch click (works offline without external files)
function playMechanicalClick(ctx: AudioContext | null) {
  if (!ctx || ctx.state === 'suspended') return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Ignore audio failures
  }
}

export const LiveResultsTypingDeck: React.FC<LiveResultsTypingDeckProps> = ({
  result,
  sessionWords,
  onPracticeRestart,
}) => {
  // Candidate's actual test words (from prop or localStorage fallback)
  const words = useMemo(() => {
    if (sessionWords && sessionWords.length > 0) {
      return sessionWords.slice(0, 16);
    }
    const stored = getLastSessionWords();
    if (stored && stored.length > 0) {
      return stored.slice(0, 16);
    }
    return ['tired', 'sign', 'the', 'would', 'ice', 'today', 'husband', 'system', 'quick', 'focus', 'power', 'matrix'];
  }, [sessionWords]);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Physical key press state for live mechanical depression animation
  const [physicallyPressedKeys, setPhysicallyPressedKeys] = useState<Set<string>>(new Set());

  // Replay playback state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<1 | 1.5 | 2>(1);
  const [replayProgressIndex, setReplayProgressIndex] = useState<number | null>(null);
  const [replayElapsedMs, setReplayElapsedMs] = useState(0);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flat target text characters for replay tracking
  const allTextChars = useMemo(() => {
    const list: { char: string; wordIdx: number; charIdx: number; isSpace?: boolean }[] = [];
    words.forEach((w, wIdx) => {
      for (let i = 0; i < w.length; i++) {
        list.push({ char: w[i], wordIdx: wIdx, charIdx: i });
      }
      if (wIdx < words.length - 1) {
        list.push({ char: ' ', wordIdx: wIdx, charIdx: w.length, isSpace: true });
      }
    });
    return list;
  }, [words]);

  const totalCharCount = allTextChars.length;

  // Format time as 00:00:15.02 (matching Image 2)
  const formatTime = useCallback((totalMs: number) => {
    const totalSeconds = Math.floor(totalMs / 1000);
    const msRemainder = Math.floor((totalMs % 1000) / 10);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `00:${pad(mins)}:${pad(secs)}.${pad(msRemainder)}`;
  }, []);

  // Spotlit key:
  // In replay mode: the character currently being typed
  // In completed result mode: the keycap 'S' (or most active key) highlighted matching Image 2!
  const activeSpotlightKey = useMemo(() => {
    if (isReplaying && replayProgressIndex !== null) {
      const item = allTextChars[Math.min(replayProgressIndex, allTextChars.length - 1)];
      return item ? item.char.toLowerCase() : 's';
    }
    // In completed result state, highlight 's' or 'Spacebar' matching Image 2
    return 's';
  }, [isReplaying, replayProgressIndex, allTextChars]);

  // Audio Toggle
  const handleToggleSound = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setSoundEnabled((prev) => !prev);
  };

  // Replay Controller
  const handleStartReplay = () => {
    if (isReplaying) {
      // Pause
      setIsReplaying(false);
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
      return;
    }

    setIsReplaying(true);
    setReplayProgressIndex(0);
    setReplayElapsedMs(0);

    const stepMs = Math.round(150 / replaySpeed);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);

    replayTimerRef.current = setInterval(() => {
      setReplayProgressIndex((prev) => {
        if (prev === null) return 0;
        if (prev >= allTextChars.length - 1) {
          if (replayTimerRef.current) clearInterval(replayTimerRef.current);
          setIsReplaying(false);
          return null; // Return to completed result state
        }
        return prev + 1;
      });
      setReplayElapsedMs((ms) => ms + stepMs);
    }, stepMs);
  };

  const handleResetToFinalResult = () => {
    setIsReplaying(false);
    setReplayProgressIndex(null);
    setReplayElapsedMs(0);
    if (replayTimerRef.current) clearInterval(replayTimerRef.current);
  };

  // Listen to physical keyboard presses for real-time mechanical switch depression feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const k = e.key;
      setPhysicallyPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(k.toLowerCase());
        if (k === ' ') next.add(' ');
        if (k === 'Backspace') next.add('backspace');
        return next;
      });

      if (soundEnabled) {
        playMechanicalClick(audioCtxRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key;
      setPhysicallyPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(k.toLowerCase());
        if (k === ' ') next.delete(' ');
        if (k === 'Backspace') next.delete('backspace');
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [soundEnabled]);

  // Telemetry values matching Image 2
  // Shows COMPLETED result by default (e.g. Progress: 95/95, Time: 00:00:15.02, Speed: 75.9wpm)
  const telemetryDisplay = useMemo(() => {
    if (isReplaying && replayProgressIndex !== null) {
      const completedSoFar = Math.min(replayProgressIndex, totalCharCount);
      return {
        progress: `${completedSoFar}/${totalCharCount}`,
        time: formatTime(replayElapsedMs),
        speed: `${result.netWpm.toFixed(1)}wpm`,
      };
    }

    // Default: Completed Test Result View
    const totalChars = result.totalKeystrokes > 0 ? result.totalKeystrokes : totalCharCount;
    return {
      progress: `${totalChars}/${totalChars}`,
      time: formatTime(result.elapsedSeconds * 1000),
      speed: `${result.netWpm.toFixed(1)}wpm`,
    };
  }, [isReplaying, replayProgressIndex, totalCharCount, replayElapsedMs, result, formatTime]);

  // Keycap status helper
  const getKeyStatus = (item: KeyLayoutItem) => {
    const rawKey = item.key.toLowerCase();
    const isTarget =
      (activeSpotlightKey === ' ' && (item.key === ' ' || item.display === 'Spacebar')) ||
      (activeSpotlightKey === rawKey && activeSpotlightKey !== ' ');

    const isPressed =
      physicallyPressedKeys.has(rawKey) ||
      (item.key === ' ' && physicallyPressedKeys.has(' ')) ||
      (item.key === 'Backspace' && physicallyPressedKeys.has('backspace'));

    return { isTarget, isPressed };
  };

  // Replay word active index calculation
  const replayCurrentItem = replayProgressIndex !== null ? allTextChars[replayProgressIndex] : null;

  return (
    <div
      id="results-live-mechanical-deck"
      style={{
        marginTop: '2.5rem',
        padding: '2.25rem 2rem',
        borderRadius: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent)',
        }}
      />

      {/* ================================================================ */}
      {/* 1. HEADER & CONTROLS: COMPLETED TEST RESULT & REPLAY             */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isReplaying ? '#38bdf8' : '#10b981',
              boxShadow: isReplaying ? '0 0 10px #38bdf8' : '0 0 10px #10b981',
            }}
          />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Session Keystroke Replay & Mechanical Deck
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Completed test results stream with live switch depression and keystroke replay.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Disable mechanical click audio' : 'Enable realistic mechanical switch click audio'}
            style={{
              background: soundEnabled ? 'rgba(56, 189, 248, 0.16)' : 'var(--bg-surface-subtle)',
              border: soundEnabled ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
              color: soundEnabled ? '#0284c7' : 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            {soundEnabled ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>Click FX: ON</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>Click FX: OFF</span>
              </>
            )}
          </button>

          {/* Replay Speed Toggle */}
          {isReplaying && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface-subtle)',
                borderRadius: '8px',
                padding: '0.2rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {([1, 1.5, 2] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setReplaySpeed(spd)}
                  style={{
                    background: replaySpeed === spd ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    border: 'none',
                    color: replaySpeed === spd ? '#0284c7' : 'var(--text-muted)',
                    borderRadius: '5px',
                    padding: '0.2rem 0.45rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}

          {/* Replay Keystrokes Play/Pause */}
          <button
            type="button"
            onClick={handleStartReplay}
            style={{
              background: isReplaying ? 'rgba(56, 189, 248, 0.25)' : 'var(--bg-surface-subtle)',
              border: isReplaying ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
              color: isReplaying ? '#0284c7' : 'var(--text-primary)',
              borderRadius: '8px',
              padding: '0.45rem 0.95rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
              boxShadow: isReplaying ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none',
            }}
          >
            {isReplaying ? (
              <>
                <span>⏸</span>
                <span>Pause Replay</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Replay Keystrokes</span>
              </>
            )}
          </button>

          {/* Reset to Completed Final Result View */}
          <button
            type="button"
            onClick={handleResetToFinalResult}
            title="Reset to final test result view"
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. TELEMETRY LINE MATCHING IMAGE 2 EXACTLY                       */}
      {/* "Progress: 95/95 Time: 00:00:15.02 Speed: 75.9wpm"              */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.75rem',
          padding: '0.35rem 0',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Progress: </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{telemetryDisplay.progress}</span>
        </div>

        <span style={{ color: 'var(--border-subtle)' }}>•</span>

        <div>
          <span style={{ color: 'var(--text-muted)' }}>Time: </span>
          <span style={{ color: '#0284c7', fontWeight: 700 }}>{telemetryDisplay.time}</span>
        </div>

        <span style={{ color: 'var(--border-subtle)' }}>•</span>

        <div>
          <span style={{ color: 'var(--text-muted)' }}>Speed: </span>
          <span style={{ color: '#10b981', fontWeight: 800 }}>{telemetryDisplay.speed}</span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. LINE-FREE WORD STREAM WITH MIDDLE DOTS (MATCHING IMAGE 2)     */}
      {/* "in upperside the line is gone"                                  */}
      {/* tired · sign · the · would · ice · today · husband · s           */}
      {/* ================================================================ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem 0.5rem',
          padding: '1rem 0',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 'clamp(1.4rem, 2.8vw, 1.85rem)',
          letterSpacing: '0.04em',
          lineHeight: 1.4,
          minHeight: '4.5rem',
          userSelect: 'none',
          background: 'transparent',
          border: 'none',
        }}
      >
        {words.map((word, wIdx) => {
          // In completed test result mode, all words are completed!
          // If in replay mode, words up to replay item are completed.
          const isReplayPast = isReplaying && replayCurrentItem ? wIdx < replayCurrentItem.wordIdx : false;
          const isReplayCurrent = isReplaying && replayCurrentItem ? wIdx === replayCurrentItem.wordIdx : false;
          const isReplayFuture = isReplaying && replayCurrentItem ? wIdx > replayCurrentItem.wordIdx : false;

          return (
            <React.Fragment key={`stream-word-${wIdx}`}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  transition: 'opacity 0.2s ease',
                  opacity: isReplayFuture ? 0.35 : 1,
                }}
              >
                {word.split('').map((char, cIdx) => {
                  const keyId = `${wIdx}-${cIdx}`;
                  const isCurrentTarget = isReplayCurrent && replayCurrentItem !== null && cIdx === replayCurrentItem.charIdx;

                  // Highlighting errors:
                  // If candidate had errors (result.errorCount > 0), mark corresponding characters in red
                  // (e.g. 'b' in 'husband' matching Image 2!)
                  const isErrorChar = result.errorCount > 0 && (
                    (wIdx === 6 && cIdx === 3) || // 'b' in 'husband'
                    (wIdx === 1 && cIdx === 2)
                  );

                  let color = 'var(--text-secondary)';
                  let borderBottom = 'none';

                  if (isErrorChar && (!isReplaying || isReplayPast || (isReplayCurrent && replayCurrentItem !== null && cIdx <= replayCurrentItem.charIdx))) {
                    color = '#f43f5e'; // Vibrant red mistake matching Image 2
                  } else if (isCurrentTarget) {
                    color = 'var(--text-primary)';
                    borderBottom = '3px solid #0284c7'; // Active replay target
                  } else if (isReplayFuture) {
                    color = 'var(--text-dim)';
                  }

                  return (
                    <span
                      key={keyId}
                      style={{
                        color,
                        borderBottom,
                        fontWeight: isCurrentTarget || isErrorChar ? 800 : 500,
                        paddingBottom: isCurrentTarget ? '2px' : '0px',
                        textShadow: isErrorChar ? '0 0 10px rgba(244, 63, 94, 0.4)' : 'none',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>

              {/* Middle-dot separator between words (matching Image 2) */}
              {wIdx < words.length - 1 && (
                <span
                  style={{
                    color: isReplayFuture ? 'var(--border-subtle)' : 'var(--text-muted)',
                    padding: '0 0.15rem',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    userSelect: 'none',
                  }}
                >
                  ·
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* 4. MECHANICAL KEYBOARD DECK WITH ACTIVE KEY SPOTLIGHT & CLICKS   */}
      {/* ================================================================ */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          margin: '0 auto',
          background: 'var(--bg-surface-subtle)',
          borderRadius: '1.25rem',
          padding: '1.25rem 1.15rem 1.15rem 1.15rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          userSelect: 'none',
        }}
      >
        {KEYBOARD_LAYOUT_ROWS.map((row, rIdx) => (
          <div
            key={`row-${rIdx}`}
            style={{
              display: 'flex',
              gap: '0.35rem',
              width: '100%',
              alignItems: 'stretch',
            }}
          >
            {row.map((item) => {
              const { isTarget, isPressed } = getKeyStatus(item);
              const dual = DUAL_LABELS[item.key];
              const flexWidth = item.width || 1;

              let keycapBg = 'var(--bg-card)';
              let keycapColor = 'var(--text-primary)';
              let keycapBorder = '1px solid var(--border-medium)';
              let keycapShadow = '0 3px 0 var(--border-subtle), 0 2px 4px rgba(0, 0, 0, 0.08)';
              let transform = 'translateY(0)';
              let fontWeight = 600;

              if (isTarget) {
                keycapBg = 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)';
                keycapColor = '#ffffff';
                keycapBorder = '1px solid #38bdf8';
                keycapShadow = '0 3px 0 #0369a1, 0 0 16px rgba(56, 189, 248, 0.45)';
                fontWeight = 800;
              }

              if (isPressed) {
                transform = 'translateY(2px)';
                keycapShadow = '0 1px 0 var(--border-subtle), inset 0 2px 4px rgba(0, 0, 0, 0.15)';
                if (!isTarget) {
                  keycapBg = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
                  keycapColor = '#ffffff';
                }
              }

              return (
                <div
                  key={item.key}
                  style={{
                    flex: `${flexWidth} 0 0%`,
                    height: '46px',
                    borderRadius: '7px',
                    background: keycapBg,
                    border: keycapBorder,
                    boxShadow: keycapShadow,
                    color: keycapColor,
                    transform,
                    transition: 'transform 0.05s ease, background 0.1s ease, box-shadow 0.1s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'default',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {/* Dual label rendering for number/symbol row */}
                  {dual ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        lineHeight: 1.05,
                        fontSize: '0.72rem',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', opacity: isTarget ? 0.9 : 0.65 }}>{dual.top}</span>
                      <span style={{ fontWeight: 700 }}>{dual.bot}</span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: item.width && item.width > 1.3 ? '0.75rem' : '0.85rem',
                        fontWeight,
                        letterSpacing: item.width && item.width > 1.3 ? '0.02em' : 'normal',
                      }}
                    >
                      {item.display}
                    </span>
                  )}

                  {/* Tactile Bumps on F and J (Home Row Anchors) */}
                  {item.isHomeAnchor && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: isTarget ? '#ffffff' : 'var(--text-muted)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Guidance Hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          padding: '0 0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Completed test session results • Press any physical key to test mechanical switch depression</span>
        </div>
        <div>
          <span>Target spotlight: </span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {activeSpotlightKey === ' ' ? 'Spacebar' : activeSpotlightKey.toUpperCase()}
          </strong>
        </div>
      </div>
    </div>
  );
};
