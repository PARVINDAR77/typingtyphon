'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfileDto } from '@typingtyphon/contracts';

interface HeaderProps {
  duration?: number;
  onDurationChange?: (duration: number) => void;
  guestTestCount?: number;
  onRestart?: () => void;
  activeTab?: 'speed' | 'curriculum' | 'results' | 'multiplayer' | 'profile';
  onTabChange?: (tab: 'speed' | 'curriculum' | 'results' | 'multiplayer' | 'profile') => void;
  currentUser?: UserProfileDto | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  duration = 60,
  onDurationChange = () => {},
  guestTestCount = 0,
  onRestart = () => {},
  activeTab = 'speed',
  onTabChange,
  currentUser,
  onOpenAuth,
  hasResult = false,
}) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('typingtyphon_theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingtyphon_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '0 1rem',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {/* Brand Logo & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (onTabChange) {
                e.preventDefault();
                onTabChange('speed');
                if (onRestart) onRestart();
              }
            }}
            title="Typing Typhon — Home & Speed Test"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>TYPING</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TYPHON
              </span>
            </span>
          </Link>

          {/* Unified Desktop Navigation Tabs */}
          <nav
            aria-label="Main Navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              background: 'var(--bg-surface-subtle)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              overflowX: 'auto',
              maxWidth: '100%',
              scrollbarWidth: 'none',
            }}
          >
            {/* 1. Speed Test */}
            {onTabChange ? (
              <button
                type="button"
                onClick={() => onTabChange('speed')}
                style={{
                  background: activeTab === 'speed' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'speed' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === 'speed' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: activeTab === 'speed' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
                </svg>
                <span>Speed Test</span>
              </button>
            ) : (
              <Link
                href="/"
                style={{
                  background: activeTab === 'speed' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'speed' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === 'speed' ? 700 : 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: activeTab === 'speed' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
                </svg>
                <span>Speed Test</span>
              </Link>
            )}

            {/* 2. Academy */}
            {onTabChange ? (
              <button
                type="button"
                onClick={() => onTabChange('curriculum')}
                style={{
                  background: activeTab === 'curriculum' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'curriculum' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === 'curriculum' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: activeTab === 'curriculum' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Academy</span>
              </button>
            ) : (
              <Link
                href="/academy"
                style={{
                  background: activeTab === 'curriculum' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'curriculum' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === 'curriculum' ? 700 : 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: activeTab === 'curriculum' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Academy</span>
              </Link>
            )}

            {/* 3. Multiplayer */}
            <Link
              href="/multiplayer"
              style={{
                background: activeTab === 'multiplayer' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'multiplayer' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'multiplayer' ? 700 : 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: activeTab === 'multiplayer' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span>Multiplayer</span>
            </Link>

            {/* 4. Profile */}
            <Link
              href="/profile"
              style={{
                background: activeTab === 'profile' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'profile' ? 700 : 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </Link>

            {/* 5. Heatmap & Speed (Results) */}
            {(hasResult || activeTab === 'results') && (
              <button
                type="button"
                onClick={() => onTabChange ? onTabChange('results') : (window.location.href = '/#results')}
                style={{
                  background: activeTab === 'results' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'results' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === 'results' ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: activeTab === 'results' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Heatmap & Speed</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Section: Light/Dark Theme Switcher & Authentication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
          {/* Theme Switcher Toggle (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
            id="header-theme-toggle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--brand-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* User Profile or Login & Sign In Buttons */}
          {currentUser ? (
            <Link
              href="/profile"
              title="View Your Profile & Account"
              id="header-user-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.32rem 0.75rem',
                borderRadius: '8px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{currentUser.fullName || currentUser.username}</span>
            </Link>
          ) : (
            /* Single Unified Sign In Button */
            <button
              type="button"
              id="header-signin-btn"
              onClick={() => {
                if (onOpenAuth) {
                  onOpenAuth('register');
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?auth=register';
                }
              }}
              title="Sign In / Register an account"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.36rem 0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.25)';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
