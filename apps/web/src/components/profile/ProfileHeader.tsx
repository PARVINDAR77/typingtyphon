'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfileDto } from '@typingtyphon/contracts';
import { getTypingMasteryTier } from '../../lib/profileAnalytics';

interface ProfileHeaderProps {
  currentUser: UserProfileDto | null;
  guestTestCount: number;
  averageWpm: number;
  averageAccuracy: number;
  currentStreakDays: number;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  onOpenAuth?: () => void;
  onPracticeWeakKeys?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  currentUser,
  guestTestCount,
  averageWpm,
  averageAccuracy,
  currentStreakDays,
  selectedMode,
  onModeChange,
  onOpenAuth,
  onPracticeWeakKeys,
}) => {
  const tier = getTypingMasteryTier(averageWpm, averageAccuracy);

  const displayName = currentUser?.fullName || currentUser?.username || 'Guest Pilot';
  const displayEmail = currentUser?.email || 'Practice sessions stored locally in browser';
  const initialLetters = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : 'GP';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.85rem',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Background ambient light */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '5%',
          width: '320px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Identity Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* User Info Avatar + Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar Icon */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(14, 165, 233, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            {initialLetters}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {displayName}
              </h1>

              {/* Mastery Tier Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: `1px solid ${tier.badgeColor}`,
                  color: tier.badgeColor,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <span>{tier.icon}</span>
                <span>{tier.title}</span>
              </div>

              {/* Active Daily Streak Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#f59e0b',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <span>🔥</span>
                <span>{currentStreakDays > 0 ? `${currentStreakDays} Day Streak` : 'Streak Ready'}</span>
              </div>
            </div>

            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {displayEmail} • {currentUser ? 'Cloud Synced' : `${guestTestCount} local tests logged`}
            </p>
          </div>
        </div>

        {/* Quick CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {!currentUser && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Sign In to Save History
            </button>
          )}

          {onPracticeWeakKeys && (
            <button
              onClick={onPracticeWeakKeys}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#f43f5e',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.12)';
              }}
            >
              <span>🎯</span>
              <span>Practice Weak Keys</span>
            </button>
          )}

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
            </svg>
            Take Speed Test
          </Link>
        </div>
      </div>

      {/* Filter Toolbar Sub-row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {/* Mode Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
            TEST MODE:
          </span>
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'words', label: 'Words' },
            { id: 'punctuation', label: 'Punctuation' },
            { id: 'numbers', label: 'Numbers' },
          ].map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                style={{
                  background: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface-subtle)',
                  border: isSelected ? '1px solid var(--brand-secondary)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Global Keybr Reference Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Real-time Telemetry & Key Confidence Matrix</span>
        </div>
      </div>
    </div>
  );
};
