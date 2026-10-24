import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PracticeWidget } from '@/components/PracticeWidget';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Free Online Typing Speed Test & WPM Practice',
  description:
    'Test your typing speed and accuracy with our free online typing test. Instant WPM calculations, zero registration, and multiple test durations (15s, 30s, 60s, 120s).',
  alternates: {
    canonical: '/practice',
  },
  openGraph: {
    title: 'Free Online Typing Speed Test & WPM Practice | Typing Typhon',
    description: 'Instant WPM evaluation, real-time typing accuracy tracking, and 100% free practice.',
    type: 'website',
  },
};

export default function PracticePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is Words Per Minute (WPM) calculated in Typing Typhon?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Typing Typhon calculates WPM using the international standard formula: one "word" is standardized as 5 keystrokes. Net WPM is computed as ((Total Keystrokes / 5) - Uncorrected Errors) / Time in Minutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Net WPM and Gross WPM?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gross WPM measures your raw typing velocity regardless of errors. Net WPM penalizes mistakes by subtracting uncorrected errors from your character count, reflecting real-world productive typing speed.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is considered an average typing speed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The average casual typist produces approximately 38 to 42 WPM. Professional touch typists who do not look down at the keyboard generally range between 65 and 85 WPM, while competitive typists exceed 100+ WPM.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to create an account to test my typing speed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Typing Typhon provides full guest access with zero mandatory registration. All practice, tests, and local session analytics remain completely free.',
        },
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation Header */}
      <header style={{ width: '100%', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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

          <nav aria-label="Main Navigation" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Home
            </Link>
            <Link href="/lessons" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Curriculum
            </Link>
            <Link href="/accuracy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Accuracy Guide
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Educational & Interactive Area */}
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%', overflowX: 'hidden' }}>
          {/* Hero Heading */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Free Online <span style={{ color: 'var(--brand-primary)' }}>Typing Speed Test</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Benchmark your words-per-minute (WPM) and typing accuracy with our instant, privacy-conscious typing engine.
              Select your preferred duration below and begin typing immediately.
            </p>
          </div>

          {/* Interactive Test Widget */}
          <section aria-label="Interactive Typing Test" style={{ width: '100%' }}>
            <PracticeWidget />
          </section>

          {/* Informational & Educational Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Speed Standards Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.85rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1rem' }}>
                Typing Speed Benchmarks
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Beginner Typist:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>20 – 35 WPM</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Intermediate / Everyday:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>40 – 55 WPM</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Advanced Touch Typist:</span>
                  <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>60 – 80 WPM</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Professional / Competitive:</span>
                  <span style={{ fontWeight: 600, color: '#10B981' }}>90+ WPM</span>
                </li>
              </ul>
            </div>

            {/* Mechanics Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.85rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1rem' }}>
                How WPM is Computed
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Under the international typography standard, a &ldquo;word&rdquo; is standardized as 5 keystrokes
                (including spaces and punctuation).
              </p>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Net WPM = ((Chars / 5) - Errors) / Minutes
              </div>
            </div>
          </div>

          {/* Technique Tips Section */}
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              padding: '2rem',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '1rem' }}>
              Four Habits to Accelerate Your Typing Speed
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.35rem' }}>
                  1. Anchor on Home Row
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Always position your fingers on A-S-D-F and J-K-L-;. Return to this home resting position after every stroke.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.35rem' }}>
                  2. Never Look at the Keys
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Looking down disrupts muscle memory formation. Trust your fingertips and use the physical bumps on F and J.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.35rem' }}>
                  3. Accuracy Before Speed
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Errors cost far more time to correct than slow, clean typing. Aim for 98%+ accuracy before attempting to burst.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.35rem' }}>
                  4. Practice in Short Intervals
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  10 to 15 minutes of deliberate daily practice yields dramatically better retention than infrequent marathon sessions.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                href="/lessons"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                🎓 Start Step-by-Step Curriculum (Stage 1 to 6) →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
