'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--brand-primary), var(--brand-indigo), transparent)' }} />
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Link
              href="/"
              style={{
                fontWeight: 900,
                letterSpacing: '-0.01em',
                fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
              }}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  background: 'var(--brand-gradient)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(22, 139, 255, 0.35)',
                }}
              >
                ⚡
              </span>
              <span>TYPING TYPHON</span>
            </Link>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Type Better. Go Further.</span>
          </div>

          <nav aria-label="Footer Navigation" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Speed Test
            </Link>
            <Link href="/academy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Academy
            </Link>
            <Link href="/multiplayer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Multiplayer
            </Link>
            <Link href="/profile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Profile Analytics
            </Link>
            <Link href="/#results" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Heatmap & Speed
            </Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Terms
            </Link>
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Typing Typhon. Guest-First & Zero Paywalls.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>Distraction-free protected typing zone • 100% Free & Open</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
