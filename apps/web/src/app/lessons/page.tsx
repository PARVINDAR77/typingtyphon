'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberBadge } from '@/components/ui/CyberBadge';

interface LessonTier {
  id: string;
  name: string;
  subtitle: string;
  stageNumber: number;
  featuredTitle: string;
  featuredDesc: string;
  progress: string;
  lessons: {
    id: string;
    num: string;
    title: string;
    keys: string;
    goal: string;
    duration: string;
  }[];
}

const LESSON_TIERS: LessonTier[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    subtitle: 'Start with basics',
    stageNumber: 1,
    featuredTitle: '1. Introduction to Keyboard',
    featuredDesc: 'Learn about keyboard layout, finger positioning, and home row index anchors.',
    progress: '0/5 lessons',
    lessons: [
      { id: 'b1', num: '1.1', title: 'Home Row Resting Position', keys: 'F, J, D, K', goal: '≥ 95% Acc, 15 WPM', duration: '5 min' },
      { id: 'b2', num: '1.2', title: 'Outer Home Row Reach', keys: 'S, L, A, ;', goal: '≥ 95% Acc, 18 WPM', duration: '6 min' },
      { id: 'b3', num: '1.3', title: 'Inner Index Extensions', keys: 'G, H', goal: '≥ 95% Acc, 20 WPM', duration: '5 min' },
      { id: 'b4', num: '1.4', title: 'Home Row Word Fluency', keys: 'as, df, jk, l;', goal: '≥ 96% Acc, 22 WPM', duration: '7 min' },
      { id: 'b5', num: '1.5', title: 'Beginner Stage Benchmark', keys: 'Full Home Row', goal: '≥ 97% Acc, 25 WPM', duration: '10 min' },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Build confidence',
    stageNumber: 2,
    featuredTitle: '2. Top Row Reaching',
    featuredDesc: 'Ascend to the top QWERTY row without lifting your wrist or losing anchor positioning.',
    progress: '0/5 lessons',
    lessons: [
      { id: 'ba1', num: '2.1', title: 'Index Fingers Top Reach', keys: 'R, U', goal: '≥ 95% Acc, 22 WPM', duration: '5 min' },
      { id: 'ba2', num: '2.2', title: 'Middle Fingers Top Reach', keys: 'E, I', goal: '≥ 95% Acc, 25 WPM', duration: '6 min' },
      { id: 'ba3', num: '2.3', title: 'Ring & Pinky Top Reach', keys: 'W, O, Q, P', goal: '≥ 94% Acc, 25 WPM', duration: '8 min' },
      { id: 'ba4', num: '2.4', title: 'Top & Home Transitions', keys: 'Mixed Rows', goal: '≥ 96% Acc, 28 WPM', duration: '7 min' },
      { id: 'ba5', num: '2.5', title: 'Common Word Combinations', keys: 'the, out, you, are', goal: '≥ 97% Acc, 30 WPM', duration: '10 min' },
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    subtitle: 'Improve speed',
    stageNumber: 3,
    featuredTitle: '3. Bottom Row & Punctuation',
    featuredDesc: 'Curled finger tucks for bottom row letters alongside comma and period pacing.',
    progress: '0/5 lessons',
    lessons: [
      { id: 'i1', num: '3.1', title: 'Index Bottom Row Reaches', keys: 'V, M, B, N', goal: '≥ 95% Acc, 30 WPM', duration: '6 min' },
      { id: 'i2', num: '3.2', title: 'Middle & Ring Bottom Reaches', keys: 'C, X, , .', goal: '≥ 95% Acc, 32 WPM', duration: '7 min' },
      { id: 'i3', num: '3.3', title: 'Pinky Bottom Reach', keys: 'Z, /', goal: '≥ 94% Acc, 32 WPM', duration: '6 min' },
      { id: 'i4', num: '3.4', title: 'Tri-Row Word Mastery', keys: 'All 3 Letter Rows', goal: '≥ 96% Acc, 35 WPM', duration: '8 min' },
      { id: 'i5', num: '3.5', title: 'Punctuation Flow Drills', keys: 'Full sentences', goal: '≥ 97% Acc, 40 WPM', duration: '10 min' },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    subtitle: 'Master typing',
    stageNumber: 4,
    featuredTitle: '4. Number Row & Capitalization',
    featuredDesc: 'Opposite-hand Shift key discipline and number row extensions with zero visual lookups.',
    progress: '0/5 lessons',
    lessons: [
      { id: 'a1', num: '4.1', title: 'Opposite Shift Discipline', keys: 'Left & Right Shift', goal: '≥ 96% Acc, 40 WPM', duration: '8 min' },
      { id: 'a2', num: '4.2', title: 'Number Row Left Hand', keys: '1, 2, 3, 4, 5', goal: '≥ 95% Acc, 35 WPM', duration: '8 min' },
      { id: 'a3', num: '4.3', title: 'Number Row Right Hand', keys: '6, 7, 8, 9, 0', goal: '≥ 95% Acc, 35 WPM', duration: '8 min' },
      { id: 'a4', num: '4.4', title: 'Numbers in Real Sentences', keys: 'Dates, Stats, Numbers', goal: '≥ 96% Acc, 42 WPM', duration: '10 min' },
      { id: 'a5', num: '4.5', title: 'Advanced Speed Certification', keys: 'Complex Prose', goal: '≥ 97% Acc, 50 WPM', duration: '12 min' },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Reach the expert level',
    stageNumber: 5,
    featuredTitle: '5. Programming Symbols & Velocity',
    featuredDesc: 'Synthesize programming brackets { }, quotes, and sustained 80+ WPM velocity.',
    progress: '0/5 lessons',
    lessons: [
      { id: 'p1', num: '5.1', title: 'Brackets & Curly Braces', keys: '{}, [], ()', goal: '≥ 95% Acc, 45 WPM', duration: '8 min' },
      { id: 'p2', num: '5.2', title: 'Programming Operators', keys: '=, +, -, *, /, %, <, >', goal: '≥ 95% Acc, 45 WPM', duration: '8 min' },
      { id: 'p3', num: '5.3', title: 'Code Syntax Sprint', keys: 'JavaScript / Python', goal: '≥ 96% Acc, 55 WPM', duration: '10 min' },
      { id: 'p4', num: '5.4', title: 'Endurance Paragraph Sprint', keys: 'Continuous Prose', goal: '≥ 97% Acc, 70 WPM', duration: '12 min' },
      { id: 'p5', num: '5.5', title: 'Grandmaster 100+ WPM Track', keys: 'Full Keyboard Mastery', goal: '≥ 98% Acc, 80 WPM', duration: '15 min' },
    ],
  },
];

export default function LessonsPage() {
  const router = useRouter();
  const [activeTierId, setActiveTierId] = useState<string>('beginner');

  const selectedTier = LESSON_TIERS.find((t) => t.id === activeTierId) || LESSON_TIERS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050B18' }}>
      {/* Top Header */}
      <Header activeTab="curriculum" />

      <main style={{ flex: 1, padding: '2.5rem 1.5rem 4rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {/* Title Section */}
        <div style={{ marginBottom: '2rem' }}>
          <CyberBadge variant="cyan">ACADEMY CURRICULUM</CyberBadge>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
              fontWeight: 900,
              color: '#F5F7FF',
              margin: '0.4rem 0 0.2rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Typing Lessons
          </h1>
          <p style={{ color: '#A3B2CC', fontSize: '1rem', margin: 0 }}>
            Learn step by step and build your skills with calibrated muscle-memory drills.
          </p>
        </div>

        {/* 2-Column Layout matching Panel 3 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="lessons-grid-layout"
        >
          {/* Left Sidebar: 5 Progression Tiers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {LESSON_TIERS.map((tier) => {
              const isSelected = tier.id === activeTierId;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setActiveTierId(tier.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.18) 0%, rgba(22, 139, 255, 0.2) 100%)'
                      : 'rgba(16, 29, 54, 0.65)',
                    border: isSelected ? '1px solid #00D9FF' : '1px solid rgba(120, 160, 255, 0.18)',
                    boxShadow: isSelected ? '0 0 20px rgba(0, 217, 255, 0.3)' : 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isSelected ? 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)' : '#0A1428',
                      color: isSelected ? '#050B18' : '#00D9FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                    }}
                  >
                    {tier.stageNumber}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: isSelected ? '#00D9FF' : '#F5F7FF' }}>
                      {tier.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A3B2CC' }}>
                      {tier.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Main Stage Card matching Panel 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Featured Lesson Highlight Box */}
            <div
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(16, 29, 54, 0.95) 0%, rgba(10, 20, 40, 0.95) 100%)',
                border: '1px solid rgba(120, 160, 255, 0.22)',
                padding: '2rem',
                display: 'grid',
                gridTemplateColumns: '1fr 240px',
                gap: '2rem',
                alignItems: 'center',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CyberBadge variant="cyan">{selectedTier.progress}</CyberBadge>
                  <span style={{ fontSize: '0.8rem', color: '#A3B2CC' }}>Estimated: 25 mins</span>
                </div>

                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                  {selectedTier.featuredTitle}
                </h2>

                <p style={{ color: '#A3B2CC', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {selectedTier.featuredDesc}
                </p>

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => router.push('/?tab=curriculum')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.8rem 1.6rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
                      color: '#050B18',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
                    }}
                  >
                    <span>Start Lesson</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Graphic: 3D/Isometric Key Zone Map */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(5, 11, 24, 0.75)',
                  border: '1px solid rgba(120, 160, 255, 0.15)',
                }}
              >
                <svg viewBox="0 0 200 120" style={{ width: '100%', height: 'auto' }}>
                  <rect x="10" y="10" width="180" height="100" rx="8" fill="#101D36" stroke="#00D9FF" strokeWidth="1.5" />
                  {/* Left hand home keys */}
                  <rect x="25" y="45" width="20" height="20" rx="3" fill="#8257FF" />
                  <rect x="50" y="45" width="20" height="20" rx="3" fill="#8257FF" />
                  <rect x="75" y="45" width="20" height="20" rx="3" fill="#00D9FF" />
                  {/* Right hand home keys */}
                  <rect x="105" y="45" width="20" height="20" rx="3" fill="#00D9FF" />
                  <rect x="130" y="45" width="20" height="20" rx="3" fill="#168BFF" />
                  <rect x="155" y="45" width="20" height="20" rx="3" fill="#168BFF" />
                  {/* Spacebar */}
                  <rect x="55" y="75" width="90" height="16" rx="3" fill="#10B981" />
                </svg>
              </div>
            </div>

            {/* List of 5 Lessons inside this Tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                Curriculum Lessons ({selectedTier.name})
              </h3>

              {selectedTier.lessons.map((lesson) => (
                <CyberCard key={lesson.id} padding="1rem 1.25rem">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(0, 217, 255, 0.12)',
                          color: '#00D9FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {lesson.num}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, color: '#F5F7FF' }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#A3B2CC' }}>
                          Target Keys: <span style={{ color: '#00D9FF', fontFamily: 'var(--font-mono)' }}>{lesson.keys}</span> • Benchmark: {lesson.goal}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#A3B2CC' }}>⏱️ {lesson.duration}</span>
                      <button
                        type="button"
                        onClick={() => router.push('/?tab=curriculum')}
                        style={{
                          padding: '0.4rem 0.9rem',
                          borderRadius: '8px',
                          background: 'rgba(0, 217, 255, 0.15)',
                          border: '1px solid rgba(0, 217, 255, 0.35)',
                          color: '#00D9FF',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Practice →
                      </button>
                    </div>
                  </div>
                </CyberCard>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
