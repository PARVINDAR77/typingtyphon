'use client';

import React, { useState, useEffect } from 'react';
import { Racer } from '../../engine/RaceEngine';

interface RacePodiumModalProps {
  racers: Racer[];
  onPlayAgain: () => void;
}

const MEDAL_ICONS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '🏎️',
};

export const RacePodiumModal: React.FC<RacePodiumModalProps> = ({ racers, onPlayAgain }) => {
  const [countdown, setCountdown] = useState(12);

  // Auto-queue countdown to next race
  useEffect(() => {
    if (countdown <= 0) {
      onPlayAgain();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, onPlayAgain]);

  const sortedRacers = [...racers].sort((a, b) => a.rank - b.rank);
  const userRacer = racers.find((r) => r.isUser);
  const userRank = userRacer?.rank || 4;

  const getRankTitle = (rank: number) => {
    if (rank === 1) return 'VICTORY! 1st PLACE';
    if (rank === 2) return 'RUNNER UP! 2nd PLACE';
    if (rank === 3) return 'PODIUM FINISH! 3rd PLACE';
    return 'RACE COMPLETED! 4th PLACE';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.5rem',
          padding: '2rem 2.25rem',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Medal & Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>
            {MEDAL_ICONS[userRank] || '🏆'}
          </div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: userRank === 1 ? '#eab308' : 'var(--brand-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {getRankTitle(userRank)}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {userRank === 1
              ? 'Incredible performance! You smoked the track and claimed 1st place.'
              : 'Great sprint! Keep refining your speed and rhythm to claim the gold.'}
          </p>
        </div>

        {/* User Stats Highlight Pill Grid */}
        {userRacer && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.85rem',
              width: '100%',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Speed
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {userRacer.wpm} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>WPM</span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Accuracy
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {userRacer.accuracyPct}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Time
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {userRacer.finishTimeSec ? `${userRacer.finishTimeSec}s` : '--'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Errors
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: userRacer.errorCount > 0 ? '#f43f5e' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                {userRacer.errorCount}
              </div>
            </div>
          </div>
        )}

        {/* Final Standings Leaderboard Table */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Final Race Standings
          </span>
          <div
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              overflow: 'hidden',
            }}
          >
            {sortedRacers.map((racer, idx) => (
              <div
                key={racer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  borderBottom: idx < sortedRacers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: racer.isUser ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>
                    {MEDAL_ICONS[racer.rank] || '🏎️'}
                  </span>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '5px',
                      background: `linear-gradient(135deg, ${racer.avatarColor}, #0f172a)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      color: '#ffffff',
                    }}
                  >
                    {racer.avatarInitials}
                  </div>
                  <span style={{ fontWeight: racer.isUser ? 700 : 500, color: racer.isUser ? '#38bdf8' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                    {racer.name} {racer.isUser && '(You)'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{racer.wpm} WPM</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{racer.accuracyPct}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>{racer.finishTimeSec ? `${racer.finishTimeSec}s` : '--'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onPlayAgain}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              border: 'none',
              borderRadius: '9999px',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Race Again</span>
            <span style={{ opacity: 0.75, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              ({countdown}s)
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
