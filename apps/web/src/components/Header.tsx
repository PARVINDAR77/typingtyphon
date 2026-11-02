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
  duration = 15,
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme =
        (localStorage.getItem('typingtyphon_theme') as 'light' | 'dark') ||
        (localStorage.getItem('tt_theme') as 'light' | 'dark') ||
        'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingtyphon_theme', nextTheme);
      localStorage.setItem('tt_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const getNavStyle = (tab: string) => {
    const isActive = activeTab === tab;
    return {
      background: isActive ? 'var(--brand-pale-blue)' : 'transparent',
      border: isActive ? '1px solid var(--brand-blue-border)' : '1px solid transparent',
      color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
      borderRadius: '8px',
      padding: '0.4rem 0.85rem',
      fontSize: '0.82rem',
      fontWeight: isActive ? 700 : 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      boxShadow: isActive ? '0 1px 3px rgba(22, 139, 255, 0.12)' : 'none',
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap' as const,
      textDecoration: 'none',
    };
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
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.25rem',
          minHeight: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Brand Logo & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
              gap: '0.65rem',
              textDecoration: 'none',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(22, 139, 255, 0.35)',
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.1rem',
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
                  background: 'var(--brand-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TYPHON
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav
            aria-label="Main Navigation"
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'var(--bg-surface-subtle)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* 1. Speed Test */}
            {onTabChange ? (
              <button
                type="button"
                onClick={() => onTabChange('speed')}
                style={getNavStyle('speed')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
                </svg>
                <span>Speed Test</span>
              </button>
            ) : (
              <Link href="/" style={getNavStyle('speed')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                style={getNavStyle('curriculum')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Academy</span>
              </button>
            ) : (
              <Link href="/academy" style={getNavStyle('curriculum')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Academy</span>
              </Link>
            )}

            {/* 3. Multiplayer */}
            <Link href="/multiplayer" style={getNavStyle('multiplayer')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span>Multiplayer</span>
            </Link>

            {/* 4. Profile */}
            <Link href="/profile" style={getNavStyle('profile')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                style={getNavStyle('results')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'nowrap' }}>
          {/* Theme Switcher Toggle (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
            id="header-theme-toggle"
            aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.95rem',
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

          {/* User Profile or Login and Sign In Buttons */}
          {currentUser ? (
            <Link
              href="/profile"
              title="View Your Profile & Account"
              id="header-user-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.36rem 0.85rem',
                borderRadius: '8px',
                background: 'var(--brand-pale-blue)',
                border: '1px solid var(--brand-blue-border)',
                color: 'var(--brand-primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-blue-border)';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{currentUser.fullName || currentUser.username}</span>
            </Link>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              {/* Log In Button */}
              <button
                type="button"
                id="header-login-btn"
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth('login');
                  } else if (typeof window !== 'undefined') {
                    window.location.href = '/?auth=login';
                  }
                }}
                title="Log in to your account"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.38rem 0.85rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
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
                Log In
              </button>

              {/* Sign In / Sign Up Button */}
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
                title="Create an account or sign in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '8px',
                  background: 'var(--brand-primary)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 139, 255, 0.28)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 139, 255, 0.38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 139, 255, 0.28)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: mobileMenuOpen ? 'var(--brand-pale-blue)' : 'var(--bg-surface-subtle)',
              border: mobileMenuOpen ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
              color: mobileMenuOpen ? 'var(--brand-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            padding: '0.75rem 1.25rem 1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {onTabChange ? (
            <button
              type="button"
              onClick={() => {
                onTabChange('speed');
                setMobileMenuOpen(false);
              }}
              style={getNavStyle('speed')}
            >
              <span>⚡ Speed Test</span>
            </button>
          ) : (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={getNavStyle('speed')}
            >
              <span>⚡ Speed Test</span>
            </Link>
          )}

          {onTabChange ? (
            <button
              type="button"
              onClick={() => {
                onTabChange('curriculum');
                setMobileMenuOpen(false);
              }}
              style={getNavStyle('curriculum')}
            >
              <span>🎓 Academy</span>
            </button>
          ) : (
            <Link
              href="/academy"
              onClick={() => setMobileMenuOpen(false)}
              style={getNavStyle('curriculum')}
            >
              <span>🎓 Academy</span>
            </Link>
          )}

          <Link
            href="/multiplayer"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('multiplayer')}
          >
            <span>🏁 Multiplayer</span>
          </Link>

          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('profile')}
          >
            <span>👤 Profile</span>
          </Link>

          {(hasResult || activeTab === 'results') && (
            <button
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange('results');
                else window.location.href = '/#results';
                setMobileMenuOpen(false);
              }}
              style={getNavStyle('results')}
            >
              <span>📊 Heatmap & Speed</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
