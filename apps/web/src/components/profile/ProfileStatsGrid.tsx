'use client';

import React from 'react';
import { ProfileAllTimeAndTodayStats } from '../../lib/profileAnalytics';

interface ProfileStatsGridProps {
  stats: ProfileAllTimeAndTodayStats;
}

export const ProfileStatsGrid: React.FC<ProfileStatsGridProps> = ({ stats }) => {
  const { allTime, today, deltas } = stats;

  const renderMetricCard = (
    title: string,
    value: string | number,
    unit: string,
    icon: React.ReactNode,
    deltaNode?: React.ReactNode,
    accentColor: string = '#38bdf8'
  ) => {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          transition: 'transform 0.15s ease, border-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.borderColor = `${accentColor}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
        }}
      >
        {/* Subtle top edge glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            opacity: 0.6,
          }}
        />

        {/* Card Header: Label & Icon */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: `${accentColor}18`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Card Metric Value */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          )}
        </div>

        {/* Delta / Subtitle Footer */}
        {deltaNode ? (
          <div style={{ marginTop: 'auto', paddingTop: '0.35rem', borderTop: '1px solid var(--border-subtle)' }}>
            {deltaNode}
          </div>
        ) : (
          <div style={{ height: '12px' }} />
        )}
      </div>
    );
  };

  const renderDeltaBadge = (diff: number, unit = '') => {
    if (diff === 0) {
      return (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Equals all-time average
        </span>
      );
    }
    const isPositive = diff > 0;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isPositive ? '#10b981' : '#f43f5e',
        }}
      >
        <span>{isPositive ? '▲ +' : '▼ '}</span>
        <span>{diff} {unit} vs avg</span>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. All-Time Statistics Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📊 All-Time Statistics
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              Lifetime Career
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total keystrokes: {allTime.totalKeystrokes.toLocaleString()}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {renderMetricCard(
            'Total Time',
            allTime.totalPracticeTimeFormatted,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Math.round(allTime.totalPracticeTimeSeconds / 60)} minutes total practice</span>,
            '#38bdf8'
          )}

          {renderMetricCard(
            'Total Tests',
            allTime.totalCompletedTests,
            'runs',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{allTime.totalErrors} errors logged</span>,
            '#818cf8'
          )}

          {renderMetricCard(
            'Top Speed',
            allTime.bestNetWpm,
            'WPM',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h6l-7 10 2-10H6l7-10z"/></svg>,
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>Personal Record</span>,
            '#0ea5e9'
          )}

          {renderMetricCard(
            'Average Speed',
            allTime.averageNetWpm,
            'WPM',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net typing pace</span>,
            '#38bdf8'
          )}

          {renderMetricCard(
            'Top Accuracy',
            `${allTime.bestAccuracyPct}%`,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Peak Precision</span>,
            '#10b981'
          )}

          {renderMetricCard(
            'Average Accuracy',
            `${allTime.averageAccuracyPct}%`,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Weighted touch accuracy</span>,
            '#10b981'
          )}
        </div>
      </div>

      {/* 2. Today's Statistics Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📅 Statistics for Today
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.12rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: deltas.hasTodayActivity ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: deltas.hasTodayActivity ? '#10b981' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {deltas.hasTodayActivity ? `${today.totalCompletedTests} Tests Completed Today` : 'No tests taken today'}
            </span>
          </div>
          {deltas.hasTodayActivity && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Practiced {today.totalPracticeTimeFormatted} today
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {renderMetricCard(
            'Time Today',
            today.totalPracticeTimeFormatted,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily dedicated time</span>,
            '#38bdf8'
          )}

          {renderMetricCard(
            'Tests Today',
            today.totalCompletedTests,
            'runs',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{today.totalErrors} errors today</span>,
            '#818cf8'
          )}

          {renderMetricCard(
            'Today Top Speed',
            today.bestNetWpm,
            'WPM',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h6l-7 10 2-10H6l7-10z"/></svg>,
            today.bestNetWpm >= allTime.bestNetWpm && today.bestNetWpm > 0 ? (
              <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 700 }}>🏆 New All-Time Record!</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peak run today</span>
            ),
            '#0ea5e9'
          )}

          {renderMetricCard(
            'Today Avg Speed',
            today.averageNetWpm,
            'WPM',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
            deltas.hasTodayActivity ? renderDeltaBadge(deltas.wpmDiff, 'WPM') : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting runs</span>,
            '#38bdf8'
          )}

          {renderMetricCard(
            'Today Top Acc',
            `${today.bestAccuracyPct}%`,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cleanest run today</span>,
            '#10b981'
          )}

          {renderMetricCard(
            'Today Avg Acc',
            `${today.averageAccuracyPct}%`,
            '',
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>,
            deltas.hasTodayActivity ? renderDeltaBadge(deltas.accDiff, '%') : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting runs</span>,
            '#10b981'
          )}
        </div>
      </div>
    </div>
  );
};
