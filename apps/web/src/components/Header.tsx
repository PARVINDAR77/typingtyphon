'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfileDto } from '@typingtyphon/contracts';

interface HeaderProps {
  duration?: number;
  onDurationChange?: (duration: number) => void;
  guestTestCount?: number;
  onRestart?: () => void;
  activeTab?: 'speed' | 'practice' | 'curriculum' | 'results' | 'multiplayer' | 'profile' | 'challenges' | 'leaderboard';
  onTabChange?: (tab: any) => void;
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
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme =
        (localStorage.getItem('typingtyphon_theme') as 'light' | 'dark') ||
        (localStorage.getItem('tt_theme') as 'light' | 'dark') ||
        'dark';
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

  const getNavStyle = (tab: string, path: string) => {
    const isActive = activeTab === tab;
    return {
      background: isActive ? 'linear-gradient(135deg, rgba(22, 139, 255, 0.2) 0%, rgba(130, 87, 255, 0.2) 100%)' : 'transparent',
      border: isActive ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid transparent',
      color: isActive ? '#00D9FF' : 'var(--text-secondary, #A3B2CC)',
      borderRadius: '8px',
      padding: '0.42rem 0.85rem',
      fontSize: '0.84rem',
      fontWeight: isActive ? 700 : 500,
      fontFamily: 'var(--font-heading), var(--font-sans)',
      letterSpacing: '0.02em',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      boxShadow: isActive ? '0 0 14px rgba(0, 217, 255, 0.25)' : 'none',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      whiteSpace: 'nowrap' as const,
      textDecoration: 'none',
    };
  };

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid var(--border-subtle, rgba(120, 160, 255, 0.18))',
        backgroundColor: 'rgba(5, 11, 24, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.25rem',
          minHeight: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Brand Logo & Navigation Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Logo with Futuristic Gradient 'T' Icon */}
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
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0, 217, 255, 0.45)',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16" />
                <path d="M12 7v13" />
                <path d="M9 20h6" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#F5F7FF',
                fontFamily: 'var(--font-heading), var(--font-sans)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span>TYPING</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #8257FF 100%)',
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
              gap: '0.3rem',
              background: 'rgba(10, 20, 40, 0.75)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(120, 160, 255, 0.18)',
            }}
          >
            {/* 1. Home */}
            {onTabChange ? (
              <button
                type="button"
                onClick={() => onTabChange('speed')}
                style={getNavStyle('speed', '/')}
              >
                <span>Home</span>
              </button>
            ) : (
              <Link href="/" style={getNavStyle('speed', '/')}>
                <span>Home</span>
              </Link>
            )}

            {/* 2. Practice */}
            <Link href="/practice" style={getNavStyle('practice', '/practice')}>
              <span>Practice</span>
            </Link>

            {/* 3. Lessons */}
            {onTabChange ? (
              <button
                type="button"
                onClick={() => onTabChange('curriculum')}
                style={getNavStyle('curriculum', '/lessons')}
              >
                <span>Lessons</span>
              </button>
            ) : (
              <Link href="/lessons" style={getNavStyle('curriculum', '/lessons')}>
                <span>Lessons</span>
              </Link>
            )}

            {/* 4. Challenges */}
            <Link href="/challenges" style={getNavStyle('challenges', '/challenges')}>
              <span>Challenges</span>
            </Link>

            {/* 5. Leaderboard */}
            <Link href="/leaderboard" style={getNavStyle('leaderboard', '/leaderboard')}>
              <span>Leaderboard</span>
            </Link>

            {/* 6. Progress / Profile */}
            <Link href="/profile" style={getNavStyle('profile', '/profile')}>
              <span>Progress</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Theme Toggle, User Profile or Login, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'nowrap' }}>
          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'light' ? 'Switch to Cyber Dark Mode' : 'Switch to Bright Mode'}
            id="header-theme-toggle"
            aria-label={theme === 'light' ? 'Switch to Cyber Dark Mode' : 'Switch to Bright Mode'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'rgba(16, 29, 54, 0.75)',
              border: '1px solid rgba(120, 160, 255, 0.18)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00D9FF';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 217, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.18)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* User Profile or Login Button */}
          {currentUser ? (
            <Link
              href="/profile"
              title="View Your Profile & Account"
              id="header-user-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.38rem 0.95rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(22, 139, 255, 0.15) 0%, rgba(130, 87, 255, 0.15) 100%)',
                border: '1px solid rgba(0, 217, 255, 0.4)',
                color: '#00D9FF',
                fontSize: '0.82rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading), var(--font-sans)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 14px rgba(0, 217, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00D9FF';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 14px rgba(0, 217, 255, 0.2)';
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                {currentUser.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span>{currentUser.fullName || currentUser.username}</span>
            </Link>
          ) : (
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
              title="Sign in with Google"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading), var(--font-sans)',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 18px rgba(22, 139, 255, 0.45)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 217, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 18px rgba(22, 139, 255, 0.45)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Login</span>
            </button>
          )}

          {/* Settings Gear Button */}
          <Link
            href="/admin/settings"
            title="Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'rgba(16, 29, 54, 0.75)',
              border: '1px solid rgba(120, 160, 255, 0.18)',
              color: 'var(--text-secondary, #A3B2CC)',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00D9FF';
              e.currentTarget.style.color = '#00D9FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.18)';
              e.currentTarget.style.color = 'var(--text-secondary, #A3B2CC)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'rgba(16, 29, 54, 0.75)',
              border: '1px solid rgba(120, 160, 255, 0.18)',
              color: '#F5F7FF',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(120, 160, 255, 0.18)',
            backgroundColor: 'rgba(5, 11, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Link
            href="/"
            onClick={() => {
              if (onTabChange) onTabChange('speed');
              setMobileMenuOpen(false);
            }}
            style={getNavStyle('speed', '/')}
          >
            Home
          </Link>
          <Link
            href="/practice"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('practice', '/practice')}
          >
            Practice
          </Link>
          <Link
            href="/lessons"
            onClick={() => {
              if (onTabChange) onTabChange('curriculum');
              setMobileMenuOpen(false);
            }}
            style={getNavStyle('curriculum', '/lessons')}
          >
            Lessons
          </Link>
          <Link
            href="/challenges"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('challenges', '/challenges')}
          >
            Challenges
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('leaderboard', '/leaderboard')}
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('profile', '/profile')}
          >
            Progress
          </Link>
          <Link
            href="/explorer"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('explorer', '/explorer')}
          >
            3D Explorer
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            style={getNavStyle('about', '/about')}
          >
            About
          </Link>
        </div>
      )}
    </header>
  );
};
