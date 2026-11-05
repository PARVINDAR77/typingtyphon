'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RadialGauge } from '@/components/ui/RadialGauge';
import { CyberKeyboardDeck } from '@/components/ui/CyberKeyboardDeck';
import { CyberCard } from '@/components/ui/CyberCard';
import { TypingEngine, TypingEngineState } from '@/engine/TypingEngine';
import { generateTestWords } from '@/lib/wordLists';
import {
  getPreferredDuration,
  savePreferredDuration,
  getGuestStats,
  saveGuestSession,
} from '@/lib/storage';
import { EngineResult, UserProgressSummaryDto } from '@typingtyphon/contracts';

type PracticeMode = 'time' | 'words' | 'quotes' | 'custom' | 'code';

export default function PracticePage() {
  const [duration, setDuration] = useState<number>(15);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('time');
  const [activeChar, setActiveChar] = useState<string>('a');
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>(['a', 'g']);
  const [guestStats, setGuestStats] = useState<UserProgressSummaryDto>({
    totalCompletedTests: 0,
    totalPracticeTimeSeconds: 0,
    bestNetWpm: 0,
    averageNetWpm: 0,
    bestAccuracyPct: 100,
    averageAccuracyPct: 100,
    currentStreakDays: 0,
  });

  const [inputVal, setInputVal] = useState<string>('');
  const [testActive, setTestActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const [currentAcc, setCurrentAcc] = useState<number>(100);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Default sample texts matching Panel 2
  const sampleText =
    'The quick brown fox jumps over the lazy dog. Practice makes perfect and improves your typing skills.';
  const [targetText, setTargetText] = useState<string>(sampleText);

  useEffect(() => {
    const dur = getPreferredDuration();
    setDuration(dur);
    setTimeLeft(dur);
    const stats = getGuestStats();
    setGuestStats(stats);
  }, []);

  const handleDurationChange = (d: number) => {
    setDuration(d);
    savePreferredDuration(d);
    handleResetTest(d);
  };

  const handleResetTest = (newDur = duration) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInputVal('');
    setTestActive(false);
    setTimeLeft(newDur);
    setCurrentWpm(0);
    setCurrentAcc(100);
    setActiveChar(targetText[0] || 't');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startTimer = () => {
    if (testActive) return;
    setTestActive(true);
    const startTime = Date.now();
    const dur = duration;

    timerRef.current = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, dur - elapsedSec);
      setTimeLeft(remaining);

      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTestActive(false);
      }
    }, 250);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!testActive && val.length > 0) {
      startTimer();
    }
    setInputVal(val);

    // Track active target character for 3D/2D keyboard highlighting
    const nextCharIndex = val.length;
    if (nextCharIndex < targetText.length) {
      const char = targetText[nextCharIndex];
      setActiveChar(char);
      setHighlightedKeys([char, 'g']);
    }

    // Real-time WPM calculation (standard 5-character word)
    const elapsed = Math.max(1, duration - timeLeft);
    let correctCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correctCount++;
    }
    const rawWpm = Math.round((correctCount / 5) / (elapsed / 60));
    const accuracy = val.length > 0 ? Math.round((correctCount / val.length) * 100) : 100;
    setCurrentWpm(rawWpm);
    setCurrentAcc(accuracy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050B18' }}>
      {/* Global Header */}
      <Header
        duration={duration}
        onDurationChange={handleDurationChange}
        guestTestCount={guestStats.totalCompletedTests}
        onRestart={() => handleResetTest()}
        activeTab="practice"
        onTabChange={() => {}}
        currentUser={null}
        onOpenAuth={() => {}}
        hasResult={false}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem 4rem 1.5rem', width: '100%' }}>
        <div style={{ maxWidth: '1240px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* =========================================================================
              PANEL 2: MODE SELECTOR BAR (Time, Words, Quotes, Custom, Code, Settings)
             ========================================================================= */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '16px',
              background: 'rgba(16, 29, 54, 0.65)',
              border: '1px solid rgba(120, 160, 255, 0.18)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'time', label: 'Time', icon: '⏱' },
                { id: 'words', label: 'Words', icon: '≡' },
                { id: 'quotes', label: 'Quotes', icon: '❝' },
                { id: 'custom', label: 'Custom', icon: '⌨' },
                { id: 'code', label: 'Code', icon: '💻' },
              ].map((m) => {
                const isSelected = practiceMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPracticeMode(m.id as PracticeMode);
                      handleResetTest();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #00D9FF' : '1px solid transparent',
                      background: isSelected ? 'rgba(0, 217, 255, 0.18)' : 'transparent',
                      color: isSelected ? '#00D9FF' : '#A3B2CC',
                      boxShadow: isSelected ? '0 0 15px rgba(0, 217, 255, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => alert('Practice Engine Settings: Standard 5-char WPM formula, sound on keystroke, instantaneous error highlight.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(10, 20, 40, 0.8)',
                border: '1px solid rgba(120, 160, 255, 0.18)',
                color: '#A3B2CC',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <span>⚙</span>
              <span>Settings</span>
            </button>
          </div>

          {/* =========================================================================
              PANEL 2: 2-COLUMN ARENA (Left: Typing + Keyboard | Right: Radial Stats)
             ========================================================================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 720px), 1fr)) 320px',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {/* Left Main Column: Live Metrics + Text Display + Keyboard Deck */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Telemetry Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  background: 'rgba(16, 29, 54, 0.5)',
                  border: '1px solid rgba(120, 160, 255, 0.16)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem', color: '#00D9FF' }}>⚡</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                      {currentWpm || (testActive ? 0 : 72)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      WPM
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem', color: '#168BFF' }}>🎯</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                      {currentAcc}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Accuracy
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.4rem', color: '#8257FF' }}>⏱️</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Time
                    </div>
                  </div>
                </div>
              </div>

              {/* Large Distraction-Free Text Display */}
              <div
                onClick={() => inputRef.current?.focus()}
                style={{
                  position: 'relative',
                  padding: '2rem',
                  borderRadius: '20px',
                  background: 'rgba(10, 20, 40, 0.85)',
                  border: '1px solid rgba(120, 160, 255, 0.22)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
                  minHeight: '160px',
                  cursor: 'text',
                }}
              >
                {/* Hidden input capturing keystrokes */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={handleInputChange}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    left: 0,
                    top: 0,
                  }}
                  autoFocus
                />

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.4rem',
                    lineHeight: 1.8,
                    letterSpacing: '0.02em',
                  }}
                >
                  {targetText.split('').map((char, index) => {
                    let color = 'rgba(163, 178, 204, 0.4)';
                    let bg = 'transparent';
                    const isTyped = index < inputVal.length;
                    const isCurrent = index === inputVal.length;

                    if (isTyped) {
                      const isCorrect = inputVal[index] === char;
                      color = isCorrect ? '#10B981' : '#EF4444';
                      if (!isCorrect) bg = 'rgba(239, 68, 68, 0.2)';
                    } else if (isCurrent) {
                      color = '#F5F7FF';
                      bg = 'rgba(0, 217, 255, 0.35)';
                    }

                    return (
                      <span
                        key={index}
                        style={{
                          color,
                          backgroundColor: bg,
                          borderRadius: '2px',
                          borderBottom: isCurrent ? '2px solid #00D9FF' : 'none',
                          transition: 'color 0.1s ease',
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Cyber Keyboard Deck (Exact Match to Panel 2 Bottom) */}
              <CyberKeyboardDeck activeChar={activeChar} highlightedKeys={highlightedKeys} />
            </div>

            {/* Right Sidebar Column: Radial Gauge + Best Score + Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <CyberCard padding="1.75rem 1.25rem">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
                  {/* Big Circular Accuracy Gauge */}
                  <RadialGauge
                    value={currentAcc}
                    size={140}
                    strokeWidth={12}
                    label="Accuracy"
                  />

                  {/* Best Score Metric */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.72rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Best Score
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#F5F7FF' }}>
                        {guestStats.bestNetWpm > 0 ? `${guestStats.bestNetWpm} WPM` : '92 WPM'}
                      </div>
                    </div>
                  </div>

                  {/* Restart Test Button (Gradient Purple/Blue matching Panel 2) */}
                  <button
                    type="button"
                    onClick={() => handleResetTest()}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)',
                      color: '#F5F7FF',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(130, 87, 255, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>Restart Test</span>
                    <span>↻</span>
                  </button>

                  {/* Timer Duration Pills (15s, 30s, 60s, 120s with 15s Default) */}
                  <div style={{ display: 'flex', gap: '0.45rem', width: '100%', justifyContent: 'center' }}>
                    {[15, 30, 60, 120].map((s) => {
                      const isSelected = duration === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleDurationChange(s)}
                          style={{
                            flex: 1,
                            padding: '0.4rem 0',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #00D9FF' : '1px solid rgba(120, 160, 255, 0.18)',
                            background: isSelected ? 'rgba(0, 217, 255, 0.2)' : 'rgba(10, 20, 40, 0.6)',
                            color: isSelected ? '#00D9FF' : '#A3B2CC',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {s}s
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CyberCard>
            </div>
          </div>
        </div>
      </main>

      {/* Global Cyber Footer */}
      <Footer />
    </div>
  );
}
