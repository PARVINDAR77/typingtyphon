import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Typing Accuracy Guide & Weak-Key Diagnostics',
  description:
    'Learn how typing accuracy drives real typing speed. Discover why errors compound WPM penalties, how to diagnose weak-key error hotspots, and methods to reach 98%+ accuracy.',
  alternates: {
    canonical: '/accuracy',
  },
  openGraph: {
    title: 'Typing Accuracy Guide & Weak-Key Diagnostics | Typing Typhon',
    description: 'Master typing accuracy to unlock true typing speed. Understand error penalties, key tracking, and remedial practice.',
    type: 'website',
  },
};

export default function AccuracyPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Science of Typing Accuracy: Why Accuracy is the True Engine of Speed',
    description: 'An in-depth analysis of how typing errors impair cognitive flow and reduce net WPM, and how deliberate per-key practice eliminates typos.',
    author: {
      '@type': 'Organization',
      name: 'Typing Typhon',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Header */}
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
            <Link href="/practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Speed Test
            </Link>
            <Link href="/lessons" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Curriculum
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Hero Heading */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              The Science of <span style={{ color: 'var(--brand-primary)' }}>Typing Accuracy</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Most typists hit a frustrating speed plateau not because their fingers cannot move fast enough,
              but because high error rates constantly interrupt their rhythm. Learn how to train for precision.
            </p>
          </div>

          {/* Core Concept: The Penalty of Mistakes */}
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '1rem' }}>
              The Triple Penalty of a Single Typo
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              When you type the wrong letter, you don&rsquo;t simply lose 1 character. A single typo triggers three
              successive mechanical penalties:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: '#F43F5E', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>PENALTY 1</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>The Cognitive Freeze</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Your brain registers the mismatch, halting the predictive pipeline of upcoming words for 150–300 milliseconds.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: '#F43F5E', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>PENALTY 2</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>The Correction Overhead</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Your right pinky must extend to the Backspace key, reverse the cursor, and re-reach the target letter.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ color: '#F43F5E', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>PENALTY 3</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Net WPM Deduction</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Standard WPM scoring subtracts uncorrected errors directly from gross words, heavily depressing your score.
                </p>
              </div>
            </div>
          </section>

          {/* Accuracy Benchmark Chart */}
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Why 98% is the Golden Rule
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Typing at 90% accuracy means you are miskeying one out of every ten characters. At that rate,
              muscle memory cannot stabilize because neural pathways are constantly reinforced with conflicting key positions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #F43F5E' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Below 94% Accuracy — High Cognitive Friction</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Typist is rushing ahead of finger coordination; speeds fluctuate erratically.</div>
                </div>
                <span style={{ color: '#F43F5E', fontWeight: 800, fontSize: '0.9rem' }}>Slow Down</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #F59E0B' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>95% – 97% Accuracy — Developing Muscle Memory</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Solid baseline, but weak keys (often pinky reaches or numbers) still trigger pauses.</div>
                </div>
                <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.9rem' }}>Good Rhythm</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', borderLeft: '4px solid #10B981' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>98%+ Accuracy — The Flow State</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rhythm is unbroken; speed increases naturally as finger transitions fluidly link.</div>
                </div>
                <span style={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem' }}>Optimal</span>
              </div>
            </div>
          </section>

          {/* Action Call to Action */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ready to Measure Your True Baseline?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.6 }}>
              Complete a 60-second test on Typing Typhon. Our engine generates an exact per-key error breakdown
              highlighting your accuracy rate across each alphabet row.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/practice"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                ⚡ Start Accuracy Test →
              </Link>
              <Link
                href="/lessons"
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                🎓 Practice Targeted Drills
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
