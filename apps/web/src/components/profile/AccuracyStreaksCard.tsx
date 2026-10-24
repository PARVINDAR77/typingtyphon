'use client';

import React from 'react';
import { AccuracyStreaks } from '../../lib/profileAnalytics';

interface AccuracyStreaksCardProps {
  streaks: AccuracyStreaks;
}

export const AccuracyStreaksCard: React.FC<AccuracyStreaksCardProps> = ({ streaks }) => {
  const streakItems = [
    {
      title: 'Accuracy ≥ 95%',
      subtitle: 'Consistent Touch Typing',
      current: streaks.streak95.current,
      longest: streaks.streak95.longest,
      icon: '🎯',
      color: '#38bdf8',
      milestone: 10,
    },
    {
      title: 'Accuracy ≥ 98%',
      subtitle: 'High Precision Cadence',
      current: streaks.streak98.current,
      longest: streaks.streak98.longest,
      icon: '✨',
      color: '#10b981',
      milestone: 5,
    },
    {
      title: '100% Accuracy',
      subtitle: 'Zero Errors Flawless Run',
      current: streaks.streak100.current,
      longest: streaks.streak100.longest,
      icon: '💎',
      color: '#eab308',
      milestone: 3,
    },
    {
      title: 'Daily Practice Streak',
      subtitle: 'Consecutive Days Active',
      current: streaks.dailyStreak.current,
      longest: streaks.dailyStreak.longest,
      icon: '🔥',
      color: '#f59e0b',
      milestone: 7,
    },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(14px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            🔥 Accuracy Streaks & Milestones
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Consecutive high-accuracy tests completed without slipping below threshold
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {streakItems.map((item) => {
          const progressPct = Math.min(100, Math.round((item.current / item.milestone) * 100));

          return (
            <div
              key={item.title}
              style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.85rem',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Row: Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.35rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {/* Middle Row: Current vs Longest */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Current Streak
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: item.color,
                        lineHeight: 1,
                      }}
                    >
                      {item.current}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>tests</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Record
                  </span>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.longest} tests
                  </div>
                </div>
              </div>

              {/* Progress bar towards next milestone */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  <span>Goal: {item.milestone} tests</span>
                  <span>{progressPct}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--border-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      borderRadius: '9999px',
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}88`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
