import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Typing Typhon Privacy Policy: Learn how our guest-first typing practice works, how local data persistence is managed, and our strict zero-keystroke-logging policy.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Bar */}
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
              ← Back to Practice
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Article */}
      <main style={{ flex: 1, padding: '3.5rem 1.5rem' }}>
        <article
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '2.5rem 2rem',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Last updated: {lastUpdated} • Effective Date: {lastUpdated}
          </p>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              1. Guest-First Philosophy & Zero Registration Wall
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon is built around open access to foundational education. Anyone can practice touch typing,
              execute speed tests, and review performance analytics as a guest with <strong>zero mandatory registration</strong>.
              We do not gate basic practice behind a sign-up wall.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              2. Strict Keystroke Content Privacy
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              <strong>We do not record, transmit, or log the raw text you type.</strong> All character comparison,
              accuracy evaluation, and Words Per Minute (WPM) calculations are computed locally inside your browser
              by our client-side typing engine.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Only aggregate performance metrics (such as duration, net WPM, gross WPM, overall accuracy percentage,
              and per-key error counts) are calculated. Your keystroke text never leaves your client device.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              3. Local Browser Storage (Guests)
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              For guest visitors, test history, curriculum lesson progress, and weak-key analytics are stored directly
              on your computer using standard browser storage APIs:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li><strong>IndexedDB:</strong> Stores guest typing session history with per-key timing breakdowns.</li>
              <li><strong>localStorage:</strong> Stores lightweight state such as curriculum stage completion and UI preferences.</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)' }}>
              This data remains strictly under your control on your machine. You can erase it at any time by clearing
              your browser storage or clicking &ldquo;Clear Local History&rdquo; on the homepage.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              4. Optional Accounts & Cloud Synchronization
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              If you choose to create an account to synchronize your progress across multiple devices:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li><strong>Credentials:</strong> We store your email address and a cryptographically salted and hashed password using Argon2id. We never have access to your plain-text password.</li>
              <li><strong>Session Tokens:</strong> Authentication tokens are issued via secure, HttpOnly, SameSite cookies to protect against unauthorized cross-site access.</li>
              <li><strong>Progress Records:</strong> When you migrate your guest history or complete logged-in tests, session summary metrics (WPM, accuracy, time elapsed, and curriculum milestones) are synchronized to our PostgreSQL database.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              5. Cookies and Web Storage Disclosures
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon uses only strictly necessary browser storage mechanisms:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
              <li><strong>Essential Session Cookie:</strong> Enables secure session authentication if you choose to log in.</li>
              <li><strong>Functional Local Storage:</strong> Preserves your test settings (e.g. 15s vs 60s duration) and guest progress locally.</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)' }}>
              We do not deploy third-party cross-site advertising trackers or behavioural fingerprinting scripts.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              6. Advertising & Active Typing Canvas Protection
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Typing Typhon maintains a strict <em>Active Canvas Protection</em> rule: Display advertisements
              will never be placed inside the typing practice canvas or obstruct the keyboard and timer controls.
              No advertising scripts are loaded in the current release.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              7. Data Deletion and User Rights
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Guests can delete all stored history immediately through their browser settings or using the in-app
              &ldquo;Clear Local History&rdquo; action. Registered users can request account closure and total erasure
              of their synchronized cloud metrics by contacting the administration team.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.75rem' }}>
              8. Contact & Privacy Inquiries
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              For questions regarding this Privacy Policy or your data, please contact the maintainers via the official
              project repository or email at <code style={{ color: 'var(--brand-primary)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>privacy@typingtyphon.internal</code>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
