'use client';

import React, { useState, useMemo } from 'react';
import { KeyMasteryRow, KeyMasteryStatus } from '../../lib/profileAnalytics';

interface KeyMasteryMatrixProps {
  keyRows: KeyMasteryRow[];
  onPracticeKeys?: (keys: string[]) => void;
}

export const KeyMasteryMatrix: React.FC<KeyMasteryMatrixProps> = ({
  keyRows,
  onPracticeKeys,
}) => {
  const [filter, setFilter] = useState<'all' | 'weak' | 'mastered'>('all');
  const [hoveredKey, setHoveredKey] = useState<KeyMasteryRow | null>(null);

  const filteredRows = useMemo(() => {
    if (filter === 'weak') {
      return keyRows.filter((r) => r.status === 'hesitant' || (r.status === 'learning' && r.totalAttempts >= 5));
    }
    if (filter === 'mastered') {
      return keyRows.filter((r) => r.status === 'mastered');
    }
    return keyRows;
  }, [keyRows, filter]);

  const masteredCount = useMemo(() => keyRows.filter((r) => r.status === 'mastered').length, [keyRows]);
  const weakCount = useMemo(() => keyRows.filter((r) => r.status === 'hesitant' || (r.status === 'learning' && r.totalAttempts >= 5)).length, [keyRows]);

  const getStatusColor = (status: KeyMasteryStatus) => {
    switch (status) {
      case 'mastered':
        return '#10b981'; // emerald
      case 'learning':
        return '#f59e0b'; // amber
      case 'hesitant':
        return '#f43f5e'; // rose
      default:
        return '#334155'; // dark slate
    }
  };

  const getStatusLabel = (status: KeyMasteryStatus) => {
    switch (status) {
      case 'mastered':
        return 'Mastered';
      case 'learning':
        return 'Learning';
      case 'hesitant':
        return 'Hesitant';
      default:
        return 'Untested';
    }
  };

  const weakKeyLetters = useMemo(() => {
    return keyRows
      .filter((r) => r.status === 'hesitant' || (r.status === 'learning' && r.totalAttempts >= 5))
      .map((r) => r.letter);
  }, [keyRows]);

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
      {/* Header and Filter Switcher */}
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
              ⌨️ Learning Progress Overview
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              {masteredCount} of 26 Keys Mastered
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Individual letter latency, touch accuracy, and session progression timeline (A to Z)
          </p>
        </div>

        {/* Filter Pills & Drill Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.2rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: '9999px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: filter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All Keys (26)
            </button>
            <button
              onClick={() => setFilter('weak')}
              style={{
                background: filter === 'weak' ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: filter === 'weak' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Needs Practice ({weakCount})
            </button>
            <button
              onClick={() => setFilter('mastered')}
              style={{
                background: filter === 'mastered' ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: filter === 'mastered' ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Mastered ({masteredCount})
            </button>
          </div>

          {weakKeyLetters.length > 0 && onPracticeKeys && (
            <button
              onClick={() => onPracticeKeys(weakKeyLetters)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#f43f5e',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>⚡</span>
              <span>Drill {weakKeyLetters.length} Weak Keys</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          paddingBottom: '0.35rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Status Key:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981' }} />
          <span>Mastered (&lt;210ms, &ge;95%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f59e0b' }} />
          <span>Learning (210-350ms)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f43f5e' }} />
          <span>Hesitant (&gt;350ms or Errors)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#94a3b8' }} />
          <span>Untested</span>
        </div>
      </div>

      {/* 26-Row Table Layout */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>KEY</th>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LATENCY</th>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCURACY</th>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATTEMPTS</th>
              <th style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                PROGRESSION TIMELINE (RECENT SESSIONS)
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const statusColor = getStatusColor(row.status);
              const statusLabel = getStatusLabel(row.status);

              return (
                <tr
                  key={row.letter}
                  onMouseEnter={() => setHoveredKey(row)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.12s ease',
                  }}
                >
                  {/* Key Cap */}
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)',
                        borderBottom: '3px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {row.letter.toUpperCase()}
                    </div>
                  </td>

                  {/* Status Pill */}
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: `${statusColor}18`,
                        border: `1px solid ${statusColor}44`,
                        color: statusColor,
                        fontSize: '0.725rem',
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: statusColor }} />
                      {statusLabel}
                    </span>
                  </td>

                  {/* Latency */}
                  <td style={{ padding: '0.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {row.latencyMs > 0 ? (
                      <span style={{ color: row.latencyMs < 210 ? '#10b981' : row.latencyMs < 350 ? '#f59e0b' : '#f43f5e' }}>
                        {row.latencyMs} ms
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Accuracy */}
                  <td style={{ padding: '0.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {row.totalAttempts > 0 ? (
                      <span style={{ color: row.accuracyPct >= 95 ? '#10b981' : row.accuracyPct >= 88 ? '#f59e0b' : '#f43f5e' }}>
                        {row.accuracyPct}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Attempts */}
                  <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                    {row.totalAttempts.toLocaleString()}
                  </td>

                  {/* Progression Blocks (Keybr Style Matrix) */}
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {row.sessionTimeline.map((colStatus, idx) => {
                        const cellColor = getStatusColor(colStatus);
                        return (
                          <div
                            key={idx}
                            title={`Session #${idx + 1}: ${getStatusLabel(colStatus)}`}
                            style={{
                              width: '14px',
                              height: '20px',
                              borderRadius: '3px',
                              backgroundColor: cellColor,
                              opacity: colStatus === 'untested' ? 0.35 : 0.9,
                              transition: 'transform 0.1s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
