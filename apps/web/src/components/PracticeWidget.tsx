'use client';

import React, { useState } from 'react';
import { EngineResult } from '@typingtyphon/contracts';
import { TypingCanvas } from './TypingCanvas';
import Link from 'next/link';

export const PracticeWidget: React.FC = () => {
  const [duration, setDuration] = useState<number>(60);
  const [restartTrigger, setRestartTrigger] = useState<number>(0);
  const [lastResult, setLastResult] = useState<EngineResult | null>(null);

  const handleComplete = (result: EngineResult) => {
    setLastResult(result);
  };

  const handleRestart = () => {
    setRestartTrigger((prev) => prev + 1);
    setLastResult(null);
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    handleRestart();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Test Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Select Test Duration:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[15, 30, 60, 120].map((d) => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: duration === d ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: duration === d ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface-subtle)',
                  color: duration === d ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleRestart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '0.5rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            ↻ Reset Test
          </button>
        </div>
      </div>

      {/* Interactive Typing Canvas */}
      <div className="typing-protected-zone" style={{ padding: '0', maxWidth: '100%' }}>
        <TypingCanvas
          durationSeconds={duration}
          onComplete={handleComplete}
          restartTrigger={restartTrigger}
          onRestart={handleRestart}
        />
      </div>

      {/* Live Result Feedback Banner */}
      {lastResult && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--brand-primary)',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Test Completed
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Speed: <span style={{ color: 'var(--brand-primary)' }}>{lastResult.netWpm} WPM</span> • Accuracy:{' '}
              <span style={{ color: '#10B981' }}>{lastResult.accuracyPct}%</span> • Errors:{' '}
              <span style={{ color: lastResult.errorCount > 0 ? '#F43F5E' : '#10B981' }}>
                {lastResult.errorCount}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleRestart}
              style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <Link
              href="/accuracy"
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Analyze Mistakes →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
