'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberBadge } from '@/components/ui/CyberBadge';

export default function LeaderboardPage() {
  const [scope, setScope] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  const topThree = [
    { rank: 2, name: 'TypingPro', wpm: 118, accuracy: 98.5, crown: '🥈', color: '#94A3B8', height: 110 },
    { rank: 1, name: 'TechMaster', wpm: 125, accuracy: 99.2, crown: '👑', color: '#F59E0B', height: 145 },
    { rank: 3, name: 'KeyWizard', wpm: 112, accuracy: 97.8, crown: '🥉', color: '#D97706', height: 85 },
  ];

  const rankings = [
    { rank: 4, flag: '🇮🇳', name: 'FastFingers', wpm: 109, accuracy: 97.4 },
    { rank: 5, flag: '🇺🇸', name: 'TypoKing', wpm: 106, accuracy: 96.8 },
    { rank: 6, flag: '🇬🇧', name: 'CyberStrike', wpm: 102, accuracy: 98.1 },
    { rank: 7, flag: '🇩🇪', name: 'RapidKeys', wpm: 99, accuracy: 96.5 },
    { rank: 8, flag: '🇨🇦', name: 'VelocityNine', wpm: 95, accuracy: 97.0 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary, #050B18)' }}>
      <Header activeTab="leaderboard" />

      <main style={{ flex: 1, padding: '2rem 1.25rem 3rem 1.25rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        {/* Header Title & Scope Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '0.45rem' }}>
              <CyberBadge variant="gold">HALL OF FAME</CyberBadge>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                color: '#F5F7FF',
                fontFamily: 'var(--font-heading), var(--font-sans)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Global Leaderboard
            </h1>
            <p style={{ color: 'var(--text-secondary, #A3B2CC)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
              Top verified typists from around the world. Speed calculated by standard 5-char word telemetry.
            </p>
          </div>

          {/* Timeframe Scope Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(16, 29, 54, 0.8)',
              padding: '4px',
              borderRadius: '9999px',
              border: '1px solid rgba(120, 160, 255, 0.18)',
            }}
          >
            {(['weekly', 'monthly', 'allTime'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScope(s)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  background: scope === s ? 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)' : 'transparent',
                  border: 'none',
                  color: scope === s ? '#FFFFFF' : 'var(--text-secondary, #A3B2CC)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-heading), var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s === 'weekly' && 'Weekly'}
                {s === 'monthly' && 'Monthly'}
                {s === 'allTime' && 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Top-3 Podium (Panel 6) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '2rem 1rem 0 1rem',
            marginBottom: '3rem',
          }}
        >
          {topThree.map((podium) => (
            <div
              key={podium.rank}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '180px',
              }}
            >
              {/* Crown & Avatar */}
              <div style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>{podium.crown}</div>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${podium.color} 0%, rgba(16, 29, 54, 0.8) 100%)`,
                  border: `2px solid ${podium.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  boxShadow: `0 0 20px ${podium.color}66`,
                  marginBottom: '0.5rem',
                }}
              >
                {podium.rank}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F5F7FF', fontFamily: 'var(--font-heading)' }}>
                {podium.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#00D9FF', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
                {podium.wpm} WPM
              </div>

              {/* 3D Pedestal Block */}
              <div
                style={{
                  width: '100%',
                  height: `${podium.height}px`,
                  background: `linear-gradient(180deg, ${podium.color}22 0%, rgba(16, 29, 54, 0.95) 100%)`,
                  borderTop: `3px solid ${podium.color}`,
                  borderLeft: '1px solid rgba(120, 160, 255, 0.18)',
                  borderRight: '1px solid rgba(120, 160, 255, 0.18)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: podium.color,
                  boxShadow: `0 0 25px ${podium.color}22`,
                }}
              >
                #{podium.rank}
              </div>
            </div>
          ))}
        </div>

        {/* Ranked Standings Table */}
        <CyberCard padding="1rem">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(120, 160, 255, 0.18)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>RANK</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>PLAYER</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 700, textAlign: 'right' }}>SPEED</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 700, textAlign: 'right' }}>ACCURACY</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr
                  key={r.rank}
                  style={{
                    borderBottom: '1px solid rgba(120, 160, 255, 0.08)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#A3B2CC', fontFamily: 'var(--font-mono)' }}>
                    #{r.rank}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{r.flag}</span>
                      <span style={{ fontWeight: 700, color: '#F5F7FF', fontFamily: 'var(--font-heading)' }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#00D9FF', fontFamily: 'var(--font-mono)' }}>
                    {r.wpm} WPM
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                    {r.accuracy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CyberCard>
      </main>

      <Footer />
    </div>
  );
}

