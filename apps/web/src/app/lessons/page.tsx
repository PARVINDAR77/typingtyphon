import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Touch Typing Lessons & Structured 6-Stage Curriculum',
  description:
    'Master touch typing step-by-step with Typing Typhon’s free 6-stage curriculum. Learn home row, top row, bottom row, numbers, and symbols without looking at the keyboard.',
  alternates: {
    canonical: '/lessons',
  },
  openGraph: {
    title: 'Touch Typing Lessons & 6-Stage Curriculum | Typing Typhon',
    description: 'Learn touch typing from scratch. 6 structured stages, 25 progressive lessons, and targeted remedial drills.',
    type: 'website',
  },
};

export default function LessonsPage() {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Typing Typhon Touch Typing Academy',
    description: 'A comprehensive, systematic 6-stage curriculum designed to build touch typing muscle memory from home row to numbers and symbols.',
    provider: {
      '@type': 'Organization',
      name: 'Typing Typhon',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT15M',
    },
  };

  const stages = [
    {
      stage: 1,
      title: 'Home Row Mastery',
      keys: 'A S D F J K L ; G H',
      description: 'Establish the foundational home anchor. Learn resting positions, tactile indexing notches on F & J, and inner lateral index reaches for G & H.',
      lessonsCount: 4,
    },
    {
      stage: 2,
      title: 'Top Row Expansion',
      keys: 'E I R U T Y W O Q P',
      description: 'Ascend upward from the home row without shifting your wrist position. Train upward vertical and diagonal finger extensions.',
      lessonsCount: 5,
    },
    {
      stage: 3,
      title: 'Bottom Row Foundations',
      keys: 'V M C , X . Z / B N',
      description: 'Descend to the bottom keyboard row with precise curled finger tucks, mastering comma, period, and slash punctuation alongside letters.',
      lessonsCount: 4,
    },
    {
      stage: 4,
      title: 'Shift & Capitalization',
      keys: 'Left Shift, Right Shift, Proper Capitalization',
      description: 'Master opposite-hand shift discipline: use the right pinky for left-hand letters and the left pinky for right-hand letters to maintain typing balance.',
      lessonsCount: 4,
    },
    {
      stage: 5,
      title: 'Numbers & Symbols',
      keys: '1 2 3 4 5 6 7 8 9 0 ! @ # $ % ^ & * ( )',
      description: 'Conquer the number row and standard mathematical and programming symbols without looking away from your screen.',
      lessonsCount: 4,
    },
    {
      stage: 6,
      title: 'Advanced Speed & Fluency',
      keys: 'Quotes, Dashes, Brackets, Extended Paragraphs',
      description: 'Synthesize all rows and symbols with complex English vocabulary, paragraph-length drills, and sustained speed pacing.',
      lessonsCount: 4,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
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
            <Link href="/academy" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700 }}>
              🎓 Academy
            </Link>
            <Link href="/accuracy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
              Accuracy Guide
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Structured <span style={{ color: 'var(--brand-primary)' }}>Touch Typing Curriculum</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Learning to touch type means training your fingers to navigate the keyboard purely by muscle memory.
              Our 6-stage progressive curriculum introduces keys sequentially with dedicated intro, word, and sentence drills.
            </p>
          </div>

          {/* Primary Action Button */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/academy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                padding: '0.85rem 1.75rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              🎓 Open Interactive Academy & Begin Stage 1 →
            </Link>
          </div>

          {/* Finger Placement Map Section */}
          <section
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '2rem',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38BDF8', marginBottom: '1rem' }}>
              Standard QWERTY Finger Alignment
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Every finger on each hand has a dedicated zone of responsibility. Your fingers should always return
              to their <strong>Home Row</strong> resting position between keystrokes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                  Left Hand Responsibilities
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Pinky:</strong> 1, Q, A (Home), Z, Left Shift, Tab</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Ring:</strong> 2, W, S (Home), X</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Middle:</strong> 3, E, D (Home), C</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Index:</strong> 4, 5, R, T, F (Home Anchor), G, V, B</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Thumb:</strong> Spacebar</li>
                </ul>
              </div>

              <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                  Right Hand Responsibilities
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Index:</strong> 6, 7, Y, U, J (Home Anchor), H, N, M</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Middle:</strong> 8, I, K (Home), , (Comma)</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Ring:</strong> 9, O, L (Home), . (Period)</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Pinky:</strong> 0, P, ; (Home), /, Enter, Right Shift</li>
                  <li><strong style={{ color: 'var(--brand-primary)' }}>Thumb:</strong> Spacebar</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Curriculum Stages Grid */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              The 6 Curriculum Stages
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {stages.map((stg) => (
                <div
                  key={stg.stage}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.85rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Stage {stg.stage}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {stg.lessonsCount} Lessons
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {stg.title}
                  </h3>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: 'var(--brand-primary)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Target: {stg.keys}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1 }}>
                    {stg.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
