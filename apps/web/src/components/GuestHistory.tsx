'use client';

import React, { useState } from 'react';
import { GuestSessionMigrationItem, UserProgressSummaryDto } from '@typingtyphon/contracts';

interface GuestHistoryProps {
  sessions: GuestSessionMigrationItem[];
  stats: UserProgressSummaryDto;
  onClearHistory: () => void;
}

export const GuestHistory: React.FC<GuestHistoryProps> = ({
  sessions,
  stats,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sessions.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.85rem',
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.85rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10b981, #38bdf8, transparent)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#059669',
                padding: '0.22rem 0.7rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.15)',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span>Telemetry History</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>0 Tests Recorded</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', letterSpacing: '-0.01em' }}>
            Personal Bests & Trends
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Your practice tests and speed metrics are saved automatically to your browser. Complete your first test above to unlock rolling stats.
          </p>
        </div>

        {/* 4 Stat Placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BEST SPEED</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>-- WPM</div>
          </div>
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVG SPEED</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>-- WPM</div>
          </div>
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACCURACY</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>-- %</div>
          </div>
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.65rem 0.85rem', borderRadius: '0.65rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRACTICE TIME</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>0s</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.85rem',
        padding: '1.15rem 1.25rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10b981, #38bdf8, transparent)' }} />

      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#059669',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>Telemetry History</span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            {sessions.length} tests
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              best:{' '}
              <strong style={{ color: '#0ea5e9', fontWeight: 700 }}>{stats.bestNetWpm} WPM</strong>
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              avg:{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{stats.averageNetWpm} WPM</strong>
            </span>
          </div>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
                color: 'var(--text-secondary)',
              }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests Completed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{stats.totalCompletedTests}</div>
            </div>
            <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Speed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0ea5e9', marginTop: '0.2rem' }}>{stats.bestNetWpm} WPM</div>
            </div>
            <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Speed</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#059669', marginTop: '0.2rem' }}>{stats.averageNetWpm} WPM</div>
            </div>
            <div style={{ background: 'var(--bg-surface-subtle)', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Practice Time</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d97706', marginTop: '0.2rem' }}>{stats.totalPracticeTimeSeconds}s</div>
            </div>
          </div>

          {/* Session Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {sessions.map((item, idx) => (
              <div
                key={item.localId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.6rem',
                  fontSize: '0.825rem',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>#{sessions.length - idx}</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{item.netWpm} WPM</span>
                  <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.accuracyPct}% Acc</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({item.durationSeconds}s)</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                  {new Date(item.clientTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* Clear Storage Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              onClick={onClearHistory}
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#fb7185',
                padding: '0.4rem 0.85rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
              }}
            >
              Clear History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
