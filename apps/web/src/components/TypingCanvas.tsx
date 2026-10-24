'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineResult, GuestSessionMigrationItem } from '@typingtyphon/contracts';
import { TypingEngine, TypingEngineState } from '../engine/TypingEngine';
import { generateTestWords } from '../lib/wordLists';

interface TypingCanvasProps {
  durationSeconds: number;
  onDurationChange?: (duration: number) => void;
  mode?: 'words' | 'punctuation' | 'numbers';
  onModeChange?: (mode: 'words' | 'punctuation' | 'numbers') => void;
  onComplete: (result: EngineResult, words?: string[]) => void;
  restartTrigger: number;
  onRestart: () => void;
  customWords?: string[];
  previousSession?: GuestSessionMigrationItem | null;
  drillBadge?: {
    stageTitle: string;
    lessonTitle: string;
    targetKeys: string[];
    passGoal: string;
  } | null;
  onActiveCharChange?: (char: string) => void;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  durationSeconds,
  onDurationChange,
  mode = 'words',
  onModeChange,
  onComplete,
  restartTrigger,
  onRestart,
  customWords,
  previousSession,
  drillBadge,
  onActiveCharChange,
}) => {
  const [engine, setEngine] = useState<TypingEngine>(() => {
    const initialWords = customWords && customWords.length > 0 ? customWords : generateTestWords(120, 42, mode);
    return new TypingEngine(initialWords, {
      durationSeconds,
      mode: mode,
    });
  });

  const [engineState, setEngineState] = useState<TypingEngineState>(() => engine.getState());
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Keybr-style Zoom & Fullscreen Controls
  const ZOOM_LEVELS = [80, 100, 125, 150] as const;
  type ZoomLevel = (typeof ZOOM_LEVELS)[number];

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = Number(localStorage.getItem('typingtyphon_zoom_level'));
      if (ZOOM_LEVELS.includes(saved as ZoomLevel)) {
        return saved as ZoomLevel;
      }
    }
    return 100;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasContainerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const updateZoomLevel = (level: ZoomLevel) => {
    setZoomLevel(level);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingtyphon_zoom_level', String(level));
    }
  };

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel);
    if (idx < ZOOM_LEVELS.length - 1) {
      updateZoomLevel(ZOOM_LEVELS[idx + 1]);
    }
  };

  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoomLevel);
    if (idx > 0) {
      updateZoomLevel(ZOOM_LEVELS[idx - 1]);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const wordsTrackRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);

  // Keybr Undo: Reset the current lesson back to 0 without re-randomizing text
  const handleUndoReplay = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    isCompletedRef.current = false;
    startTimeRef.current = null;
    setScrollOffset(0);
    engine.replayCurrentWords();
    setEngineState(engine.getState());
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [engine]);

  // Initialize or reset engine when duration, customWords, mode, or restart trigger changes
  useEffect(() => {
    isCompletedRef.current = false;
    startTimeRef.current = null;
    setScrollOffset(0);
    const wordsToUse = customWords && customWords.length > 0 ? customWords : generateTestWords(120, undefined, mode);
    const newEngine = new TypingEngine(wordsToUse, {
      durationSeconds,
      mode: mode,
    });
    setEngine(newEngine);
    setEngineState(newEngine.getState());

    // Auto focus hidden input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [durationSeconds, restartTrigger, customWords, mode]);

  // Notify parent of active target character for real-time virtual finger reach
  useEffect(() => {
    if (!onActiveCharChange) return;
    const currentWord = engineState.words[engineState.activeWordIndex];
    if (currentWord) {
      if (engineState.activeCharIndex < currentWord.originalText.length) {
        onActiveCharChange(currentWord.originalText[engineState.activeCharIndex]);
      } else {
        onActiveCharChange(' ');
      }
    }
  }, [engineState.activeWordIndex, engineState.activeCharIndex, engineState.words, onActiveCharChange]);

  // High-resolution animation timer loop
  const runTimerLoop = useCallback(() => {
    if (!startTimeRef.current || isCompletedRef.current) return;

    const now = performance.now();
    const elapsedSec = (now - startTimeRef.current) / 1000;

    engine.tickTimer(elapsedSec);
    setEngineState(engine.getState());

    if (engine.getStatus() === 'completed') {
      isCompletedRef.current = true;
      const result = engine.getResult();
      if (result) {
        onComplete(result, engine.getOriginalWords());
      }
      return;
    }

    animFrameRef.current = requestAnimationFrame(runTimerLoop);
  }, [engine, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => {
      // Detect CapsLock state
      setCapsLockActive(e.getModifierState && e.getModifierState('CapsLock'));

      // Quick restart shortcut: Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        onRestart();
        return;
      }

      // Escape key: exit fullscreen cleanly if active, otherwise restart test
      if (e.key === 'Escape') {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        } else {
          onRestart();
        }
        return;
      }

      // Keybr.com Undo: Reset the current lesson (Ctrl + Left Arrow)
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUndoReplay();
        return;
      }

      // Keybr.com Redo: Skip to next lesson (Ctrl + Right Arrow)
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        onRestart();
        return;
      }

      // Zoom Shortcuts: Alt + Plus / Alt + Minus
      if (e.altKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.altKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
        return;
      }

      if (isCompletedRef.current) return;

      // Start timer on first valid keydown
      if (engine.getStatus() === 'idle') {
        startTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(runTimerLoop);
      }

      // Handle backspace (with Ctrl/Alt support)
      if (e.key === 'Backspace') {
        e.preventDefault();
        engine.handleBackspace(e.ctrlKey || e.altKey);
        setEngineState(engine.getState());
        return;
      }

      // Ignore non-printable modifier/function keys
      if (e.key.length > 1) {
        return;
      }

      e.preventDefault();
      engine.handleKeypress(e.key);
      setEngineState(engine.getState());

      // If engine finished from word completion
      if (engine.getStatus() === 'completed' && !isCompletedRef.current) {
        isCompletedRef.current = true;
        const res = engine.getResult();
        if (res) onComplete(res, engine.getOriginalWords());
      }
    },
    [engine, onRestart, runTimerLoop, onComplete, handleUndoReplay, handleZoomIn, handleZoomOut]
  );

  // Global window listener for frictionless typing anywhere on the page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target.id !== 'canvas-hidden-input'
      ) {
        return;
      }

      if (isCompletedRef.current) return;

      handleKeyDown(e);
    };

    const handleBlur = () => {
      engine.resetKeystrokeTimer();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, engine]);

  const handleCanvasClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const { words, activeWordIndex, activeCharIndex, remainingSeconds, netWpm, accuracyPct, errorCount } = engineState;

  // Track active word line: keep lines 1, 2, and 3 stationary as user requested:
  // "let it be as it is until i do not reach last line after that you can up up one line"
  useEffect(() => {
    const activeWordEl = document.getElementById(`word-${activeWordIndex}`);
    if (activeWordEl && wordsTrackRef.current) {
      const track = wordsTrackRef.current;
      const firstWord = track.firstElementChild as HTMLElement | null;
      const baseTop = firstWord ? firstWord.offsetTop : 0;
      const wordTop = activeWordEl.offsetTop - baseTop;
      const lineHeight = activeWordEl.offsetHeight || 44;

      // 0-based line index (Line 1 = 0, Line 2 = 1, Line 3 = 2, Line 4 = 3...)
      const lineIndex = Math.max(0, Math.round(wordTop / lineHeight));

      // 3 visible lines in box (lines 0, 1, 2).
      // Keep completely static at offset 0 while typing on lines 1, 2, and 3.
      // Only when moving beyond the 3rd line (to line 4+) does it scroll up one line at a time:
      const targetOffset = lineIndex > 2 ? (lineIndex - 2) * lineHeight : 0;
      setScrollOffset(targetOffset);
    }
  }, [activeWordIndex]);

  // Synchronize active character with FingerGuide in real time
  useEffect(() => {
    if (onActiveCharChange && words[activeWordIndex]) {
      const curWord = words[activeWordIndex];
      if (activeCharIndex < curWord.chars.length) {
        onActiveCharChange(curWord.chars[activeCharIndex].char);
      } else {
        onActiveCharChange(' ');
      }
    }
  }, [words, activeWordIndex, activeCharIndex, onActiveCharChange]);

  // Format mm:ss for time remaining
  const secTotal = Math.max(0, Math.ceil(remainingSeconds));
  const timeMin = Math.floor(secTotal / 60).toString().padStart(2, '0');
  const timeSec = (secTotal % 60).toString().padStart(2, '0');
  const formattedTime = `${timeMin}:${timeSec}`;

  // Deltas against previous guest test (if available)
  const hasPrev = !!previousSession && engine.getStatus() !== 'idle';
  const wpmDelta = hasPrev ? Math.round(netWpm - previousSession.netWpm) : 0;
  const accDelta = hasPrev ? Math.round(accuracyPct - previousSession.accuracyPct) : 0;
  const errDelta = hasPrev ? errorCount - previousSession.errorCount : 0;
  const zoomConfig = {
    80: { fontSize: '1.3rem', lineHeight: '2.45rem', height: '155px' },
    100: { fontSize: '1.55rem', lineHeight: '2.85rem', height: '180px' },
    125: { fontSize: '1.9rem', lineHeight: '3.4rem', height: '215px' },
    150: { fontSize: '2.25rem', lineHeight: '3.95rem', height: '250px' },
  }[zoomLevel] || { fontSize: '1.55rem', lineHeight: '2.85rem', height: '180px' };

  return (
    <div ref={canvasContainerRef} className="typing-protected-zone" onClick={handleCanvasClick}>
      {/* Floating Exit Fullscreen Button in Focus / Zen Mode */}
      {isFullscreen && (
        <button
          type="button"
          onClick={handleToggleFullscreen}
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '2rem',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            borderRadius: '9999px',
            padding: '0.45rem 1.1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: 'var(--shadow-card)',
            zIndex: 100,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.color = 'var(--brand-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
          <span>Exit Fullscreen (Esc)</span>
        </button>
      )}

      {/* Curriculum Drill Context Banner (if active) */}
      {drillBadge && (
        <div
          style={{
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.65rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 700 }}>
              {drillBadge.stageTitle}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {drillBadge.lessonTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Keys:</span>
              {drillBadge.targetKeys.map((k) => (
                <kbd
                  key={k}
                  style={{
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    background: 'var(--brand-primary)',
                    border: '1px solid var(--brand-cyan)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {k === ' ' ? 'Space' : k.toUpperCase()}
                </kbd>
              ))}
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 600,
              }}
            >
              Goal: {drillBadge.passGoal}
            </span>
          </div>
        </div>
      )}      {/* Sleek Sub-Toolbar: Mode, Duration, Keybr Undo/Redo & Zoom Controls */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          padding: '0 0.25rem',
          margin: '0 auto 0.45rem auto',
          scrollbarWidth: 'none',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: '0.45rem',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            padding: '0.22rem 0.65rem',
            boxShadow: 'var(--shadow-card)',
            opacity: engine.getStatus() === 'running' ? 0.85 : 1,
            transition: 'all 0.2s ease',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            if (engine.getStatus() === 'running') {
              e.currentTarget.style.opacity = '0.85';
            }
          }}
        >
          {/* Mode Selector (When not in specialized curriculum drill) */}
          {!drillBadge && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {(['words', 'punctuation', 'numbers'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onModeChange?.(m)}
                    style={{
                      background: mode === m ? 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' : 'transparent',
                      border: mode === m ? '1px solid #0ea5e9' : '1px solid transparent',
                      color: mode === m ? '#ffffff' : 'var(--text-secondary)',
                      borderRadius: '9999px',
                      padding: '0.18rem 0.55rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textTransform: 'capitalize',
                      boxShadow: mode === m ? '0 2px 8px rgba(14, 165, 233, 0.35)' : 'none',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <span style={{ color: 'var(--border-subtle)', margin: '0 0.1rem', fontSize: '0.75rem', userSelect: 'none' }}>|</span>

              {/* Duration Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {[15, 30, 60, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDurationChange?.(d)}
                    style={{
                      background: durationSeconds === d ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'transparent',
                      border: durationSeconds === d ? '1px solid #0284c7' : '1px solid transparent',
                      color: durationSeconds === d ? '#ffffff' : 'var(--text-secondary)',
                      borderRadius: '9999px',
                      padding: '0.18rem 0.5rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: durationSeconds === d ? '0 2px 8px rgba(14, 165, 233, 0.35)' : 'none',
                    }}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              <span style={{ color: 'var(--border-subtle)', margin: '0 0.1rem', fontSize: '0.75rem', userSelect: 'none' }}>|</span>
            </>
          )}

          {/* Keybr.com-Style Undo & Redo Lesson Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            {/* Undo: Reset the current lesson (Ctrl + Left Arrow) */}
            <button
              type="button"
              onClick={handleUndoReplay}
              title="Reset current lesson (Ctrl + ←)"
              style={{
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.18rem 0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--brand-primary)';
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
              <span>Undo</span>
            </button>

            {/* Redo: Skip to next lesson (Ctrl + Right Arrow) */}
            <button
              type="button"
              onClick={onRestart}
              title="Skip to next lesson (Ctrl + →)"
              style={{
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.18rem 0.45rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--brand-primary)';
                e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>Redo</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
              </svg>
            </button>
          </div>

          <span style={{ color: 'var(--border-subtle)', margin: '0 0.1rem', fontSize: '0.75rem', userSelect: 'none' }}>|</span>

          {/* Keybr.com-Style Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel === 80}
              title="Zoom out typography (Alt + -)"
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomLevel === 80 ? 'var(--text-dim)' : 'var(--text-secondary)',
                cursor: zoomLevel === 80 ? 'not-allowed' : 'pointer',
                padding: '0.15rem 0.3rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              A-
            </button>

            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                padding: '0.1rem 0.2rem',
              }}
            >
              {zoomLevel}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel === 150}
              title="Zoom in typography (Alt + +)"
              style={{
                background: 'transparent',
                border: 'none',
                color: zoomLevel === 150 ? 'var(--text-dim)' : 'var(--text-secondary)',
                cursor: zoomLevel === 150 ? 'not-allowed' : 'pointer',
                padding: '0.15rem 0.3rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              A+
            </button>
          </div>

          <span style={{ color: 'var(--border-subtle)', margin: '0 0.1rem', fontSize: '0.75rem', userSelect: 'none' }}>|</span>

          {/* Fullscreen / Focus Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Distraction-Free Mode' : 'Enter Distraction-Free Fullscreen Mode (⤢)'}
            style={{
              background: isFullscreen ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
              border: isFullscreen ? '1px solid var(--brand-primary)' : 'none',
              color: isFullscreen ? 'var(--brand-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {isFullscreen ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>

          {/* Quick Restart Button */}
          <button
            type="button"
            onClick={onRestart}
            title="Restart Test (Tab or Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--brand-primary)';
              e.currentTarget.style.transform = 'rotate(45deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modern High-Contrast Live Cyber HUD Pods */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '0.65rem',
          alignItems: 'stretch',
        }}
      >
        {/* 1. Speed (WPM) Pod */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Net Speed
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
              WPM
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
            <span id="hud-wpm-value" className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
              {netWpm}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              WPM
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: wpmDelta >= 0 ? 'var(--brand-emerald)' : 'var(--brand-rose)',
                  marginLeft: 'auto',
                }}
              >
                {wpmDelta >= 0 ? `+${wpmDelta}` : `${wpmDelta}`}
              </span>
            )}
          </div>
        </div>

        {/* 2. Accuracy Pod */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #059669, #10b981)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Accuracy
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              ≥ 95%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
            <span id="hud-accuracy-value" className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: accuracyPct >= 95 ? '#059669' : '#d97706', lineHeight: 1 }}>
              {accuracyPct}%
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: accDelta >= 0 ? 'var(--brand-emerald)' : 'var(--brand-rose)',
                  marginLeft: 'auto',
                }}
              >
                {accDelta >= 0 ? `+${accDelta}%` : `${accDelta}%`}
              </span>
            )}
          </div>
        </div>

        {/* 3. Errors Pod */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #e11d48, #f43f5e)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Errors
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: 'rgba(244, 63, 94, 0.12)', color: '#e11d48' }}>
              Mistakes
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.35rem' }}>
            <span id="hud-error-value" className="tabular-nums" style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: errorCount > 0 ? '#e11d48' : 'var(--text-muted)', lineHeight: 1 }}>
              {errorCount}
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: errDelta <= 0 ? 'var(--brand-emerald)' : 'var(--brand-rose)',
                  marginLeft: 'auto',
                }}
              >
                {errDelta <= 0 ? `${errDelta}` : `+${errDelta}`}
              </span>
            )}
          </div>
        </div>

        {/* 4. Time Remaining Pod */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.65rem 0.95rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #4f46e5, #6366f1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Time Left
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
              {durationSeconds}s
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.35rem' }}>
            <span
              id="hud-timer-value"
              className="tabular-nums"
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: remainingSeconds <= 10 ? '#e11d48' : 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {formattedTime}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              s
            </span>
          </div>
        </div>
      </div>

      {/* CapsLock Warning */}
      {capsLockActive && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#f59e0b',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Caps Lock is ON
        </div>
      )}

      {/* Large Readable Protected Typing Canvas Panel */}
      <div
        id="typing-word-container"
        className="typing-canvas"
        tabIndex={0}
        onClick={() => inputRef.current?.focus()}
        style={{
          ['--canvas-font-size' as any]: zoomConfig.fontSize,
          ['--canvas-line-height' as any]: zoomConfig.lineHeight,
          ['--canvas-height' as any]: zoomConfig.height,
        }}
      >
        {/* Hidden input to capture physical keystrokes */}
        <input
          id="canvas-hidden-input"
          aria-label="Typing test input buffer"
          ref={inputRef}
          type="text"
          autoFocus
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            opacity: 0,
            left: 0,
            top: 0,
            width: '1px',
            height: '1px',
          }}
        />

        {/* Viewport that strictly clamps exactly 3 lines with zero padding bleed */}
        <div className="typing-canvas-viewport">
          {/* Track of words smoothly scrolled vertically */}
          <div
            ref={wordsTrackRef}
            className="typing-words-track"
            style={{ transform: `translateY(-${scrollOffset}px)` }}
          >
            {words.map((wordItem, wIdx) => {
              const isCurrentWord = wIdx === activeWordIndex;

              return (
                <span
                  key={wordItem.id}
                  id={`word-${wIdx}`}
                  className={`word ${isCurrentWord ? 'active-word' : ''}`}
                >
                  {wordItem.chars.map((charItem, cIdx) => {
                    const isCurrentChar = isCurrentWord && cIdx === activeCharIndex;

                    let charClassName = `char char-${charItem.state}`;
                    if (isCurrentChar) {
                      charClassName += ' char-active';
                    }

                    return (
                      <span
                        key={`${wordItem.id}-${cIdx}`}
                        id={`char-${wIdx}-${cIdx}`}
                        className={charClassName}
                        style={{ position: 'relative' }}
                      >
                        {isCurrentChar && (
                          <span id="canvas-caret" className={`caret ${engine.getStatus() === 'idle' ? 'blink' : ''}`} />
                        )}
                        {charItem.char}
                      </span>
                    );
                  })}

                  {/* Trailing caret if cursor is at the end of current word */}
                  {isCurrentWord && activeCharIndex >= wordItem.chars.length && (
                    <span className="char char-active" style={{ position: 'relative' }}>
                      <span id="canvas-caret" className="caret" />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Short Keyboard Hints Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          padding: '0 0.25rem',
        }}
      >
        {/* Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Tab</kbd>
            <span>restart test</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Esc</kbd>
            <span>{isFullscreen ? 'exit fullscreen' : 'restart'}</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Ctrl + Backspace</kbd>
            <span>clear text</span>
          </div>
        </div>

        {/* Focus guidance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
          <span>Click anywhere on the text to focus</span>
        </div>
      </div>
    </div>
  );
};
