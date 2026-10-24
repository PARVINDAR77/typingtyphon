'use client';

import React, { useState } from 'react';
import { ActivityCalendarDay } from '../../lib/profileAnalytics';

interface ActivityCalendarProps {
  days: ActivityCalendarDay[];
  totalTests: number;
  totalMinutes: number;
  activeDaysCount: number;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  days,
  totalTests,
  totalMinutes,
  activeDaysCount,
}) => {
  const [hoveredDay, setHoveredDay] = useState<ActivityCalendarDay | null>(null);

  // Group days into 16 week columns (each containing 7 days)
  const weeks: ActivityCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 4:
        return '#38bdf8'; // bright electric cyan
      case 3:
        return '#0ea5e9'; // primary cyan
      case 2:
        return '#0284c7'; // dark cyan
      case 1:
        return '#0284c7'; // cyan
      default:
        return 'var(--border-subtle)'; // idle background
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(14px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1.25rem',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header and Summary stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🗓️ Practice Activity Calendar
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#0284c7',
                fontWeight: 600,
              }}
            >
              Last 16 Weeks
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Daily practice sessions, frequency heat density, and total time invested
          </p>
        </div>

        {/* Quick summary chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Days</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {activeDaysCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 112</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Invested</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
              {totalMinutes} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mins</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Runs</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
              {totalTests}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '1.25rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: '680px' }}>
          {/* Weekday labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '2px', paddingRight: '6px' }}>
            {weekdays.map((day, idx) => (
              <div
                key={day}
                style={{
                  height: '14px',
                  fontSize: '0.675rem',
                  color: idx % 2 === 1 ? 'var(--text-muted)' : 'transparent',
                  lineHeight: '14px',
                  userSelect: 'none',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((day) => {
                  const isHovered = hoveredDay?.dateStr === day.dateStr;
                  const color = getIntensityColor(day.intensity);

                  return (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        border: isHovered ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                        transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                        transition: 'transform 0.1s ease',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Footer: Tooltip Preview + Intensity Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            minHeight: '28px',
          }}
        >
          {/* Tooltip info */}
          <div style={{ fontSize: '0.775rem', color: 'var(--text-primary)' }}>
            {hoveredDay ? (
              <span>
                <strong>{hoveredDay.dateStr}</strong>:{' '}
                {hoveredDay.testsCount > 0 ? (
                  <span style={{ color: '#0284c7' }}>
                    {hoveredDay.testsCount} test{hoveredDay.testsCount > 1 ? 's' : ''} completed ({hoveredDay.practiceMinutes}m) • {hoveredDay.avgWpm} avg WPM
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No practice runs logged</span>
                )}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Hover over a square to view daily practice breakdown</span>
            )}
          </div>

          {/* Intensity Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <span
                key={lvl}
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: getIntensityColor(lvl),
                  border: '1px solid var(--border-subtle)',
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};
