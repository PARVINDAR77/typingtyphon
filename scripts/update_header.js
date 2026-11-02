const fs = require('fs');
const path = require('path');

const headerPath = path.resolve('apps/web/src/components/Header.tsx');
let content = fs.readFileSync(headerPath, 'utf8');

// 1. Update useEffect theme load
const oldEffect = `  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('typingtyphon_theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);`;

const newEffect = `  React.useEffect(() => {
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
  }, []);`;

// 2. Update toggleTheme
const oldToggle = `  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('typingtyphon_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };`;

const newToggle = `  const toggleTheme = () => {
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
  };`;

// 3. Replace the right section: Remove guest counter, add Log In & Sign In
const oldRightSection = `        {/* Right Section: Guest Count, Light/Dark Theme Switcher & Authentication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'nowrap' }}>
          {/* Guest Test Counter Badge (when not logged in) */}
          {!currentUser && guestTestCount > 0 && (
            <span
              title="Locally recorded guest sessions"
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'var(--brand-pale-blue)',
                border: '1px solid var(--brand-blue-border)',
                borderRadius: '9999px',
                padding: '0.22rem 0.65rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-primary)' }} />
              <span>Guest • {guestTestCount} test{guestTestCount === 1 ? '' : 's'}</span>
            </span>
          )}

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

          {/* User Profile or Single Google Sign In Button */}
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
            /* Single Vivid Blue Sign In Button */
            <button
              type="button"
              id="header-signin-btn"
              onClick={() => {
                if (onOpenAuth) {
                  onOpenAuth('login');
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/?auth=login';
                }
              }}
              title="Sign in with your Google account"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.42rem 1rem',
                borderRadius: '8px',
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(22, 139, 255, 0.28)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--brand-primary-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 139, 255, 0.38)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(22, 139, 255, 0.28)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign In</span>
            </button>
          )}`;

const newRightSection = `        {/* Right Section: Light/Dark Theme Switcher & Authentication */}
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
          )}`;

// Normalize newlines to match file
const isCRLF = content.includes('\r\n');
const norm = (s) => (isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));

if (!content.includes(norm(oldEffect))) {
  console.error('Could not find oldEffect');
  process.exit(1);
}
content = content.replace(norm(oldEffect), norm(newEffect));

if (!content.includes(norm(oldToggle))) {
  console.error('Could not find oldToggle');
  process.exit(1);
}
content = content.replace(norm(oldToggle), norm(newToggle));

if (!content.includes(norm(oldRightSection))) {
  console.error('Could not find oldRightSection');
  process.exit(1);
}
content = content.replace(norm(oldRightSection), norm(newRightSection));

fs.writeFileSync(headerPath, content, 'utf8');
console.log('Successfully updated Header.tsx!');

