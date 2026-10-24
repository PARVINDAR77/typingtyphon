import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The requested page could not be found on Typing Typhon. Return to the speed test or curriculum.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{ width: '100%', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              TYPING <span style={{ color: '#38BDF8' }}>TYPHON</span>
            </span>
          </Link>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
            Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div
          style={{
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1.25rem',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              fontSize: '5rem',
              fontWeight: 900,
              color: 'var(--brand-primary)',
              lineHeight: 1,
              marginBottom: '1rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The page you are looking for doesn&rsquo;t exist, was moved, or had its URL changed.
            Get your fingers moving again with one of the quick options below:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px', margin: '0 auto' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                padding: '0.85rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
            >
              ⚡ Instant 60s Typing Test
            </Link>

            <Link
              href="/lessons"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                padding: '0.85rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid var(--border-subtle)',
              }}
            >
              🎓 Touch Typing Curriculum
            </Link>

            <Link
              href="/accuracy"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                padding: '0.65rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              🎯 Typing Accuracy Guide
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
