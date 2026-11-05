'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CyberBadge } from '../ui/CyberBadge';

interface TierData {
  id: string;
  levelNumber: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  glowColor: string;
  accentGrad: string;
  icon: string;
  duration: string;
  lessonsCount: number;
  benchmarkWpm: number;
  passThreshold: string;
  fingerDiscipline: string;
  activeKeys: string[];
  sampleSequence: string[];
  lessons: {
    id: string;
    num: string;
    title: string;
    keys: string;
    goal: string;
  }[];
}

const TIERS: TierData[] = [
  {
    id: 'beginner',
    levelNumber: 'LEVEL 01',
    name: 'Beginner',
    title: 'Home Row Anchor & Tactile Placement',
    subtitle: 'Establish foundational muscle memory on ASDF and JKL;',
    description:
      'Train your fingers to rest naturally on the home row using the physical indexing notches on the F and J keys. Master anchor stability so you never look down at your hands.',
    color: '#00D9FF',
    glowColor: 'rgba(0, 217, 255, 0.45)',
    accentGrad: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
    icon: '🎯',
    duration: '25 mins',
    lessonsCount: 5,
    benchmarkWpm: 25,
    passThreshold: '≥ 95% Acc • 20 WPM',
    fingerDiscipline: 'Left: A(Pinky), S(Ring), D(Mid), F(Index) | Right: J(Index), K(Mid), L(Ring), ;(Pinky)',
    activeKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    sampleSequence: ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', 'g', 'h', 'space'],
    lessons: [
      { id: '1.1', num: '1.1', title: 'Resting Index Anchors (F & J)', keys: 'F, J', goal: '≥ 95% Acc • 15 WPM' },
      { id: '1.2', num: '1.2', title: 'Left Hand Home Keys (A, S, D, F)', keys: 'A, S, D, F', goal: '≥ 95% Acc • 18 WPM' },
      { id: '1.3', num: '1.3', title: 'Right Hand Home Keys (J, K, L, ;)', keys: 'J, K, L, ;', goal: '≥ 95% Acc • 20 WPM' },
      { id: '1.4', num: '1.4', title: 'Inner Index Extensions (G & H)', keys: 'G, H', goal: '≥ 96% Acc • 22 WPM' },
      { id: '1.5', num: '1.5', title: 'Home Row Velocity Benchmark', keys: 'Full Home Row', goal: '≥ 97% Acc • 25 WPM' },
    ],
  },
  {
    id: 'basic',
    levelNumber: 'LEVEL 02',
    name: 'Basic',
    title: 'Top & Bottom Row Vertical Reaching',
    subtitle: 'Ascend to QWERTY and descend to ZXCVB rows',
    description:
      'Extend your reach upward to the top letter row and downward to the bottom row without lifting your palms or displacing your wrist anchors from the desk.',
    color: '#168BFF',
    glowColor: 'rgba(22, 139, 255, 0.45)',
    accentGrad: 'linear-gradient(135deg, #168BFF 0%, #6366F1 100%)',
    icon: '🚀',
    duration: '35 mins',
    lessonsCount: 5,
    benchmarkWpm: 35,
    passThreshold: '≥ 95% Acc • 30 WPM',
    fingerDiscipline: 'Upward reach: E & I(Mid), R & U(Index) | Downward curl: C & ,(Mid), V & M(Index)',
    activeKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
    sampleSequence: ['r', 'u', 'e', 'i', 'v', 'm', 'c', 't', 'y', 'w', 'o'],
    lessons: [
      { id: '2.1', num: '2.1', title: 'Index Fingers Top Reach (R & U)', keys: 'R, U', goal: '≥ 95% Acc • 22 WPM' },
      { id: '2.2', num: '2.2', title: 'Middle Fingers Top Reach (E & I)', keys: 'E, I', goal: '≥ 95% Acc • 25 WPM' },
      { id: '2.3', num: '2.3', title: 'Curled Bottom Row Tucks (V, M, C, X)', keys: 'V, M, C, X', goal: '≥ 95% Acc • 28 WPM' },
      { id: '2.4', num: '2.4', title: 'Outer Ring & Pinky Reaches (W, O, Z, P)', keys: 'W, O, Z, P', goal: '≥ 95% Acc • 28 WPM' },
      { id: '2.5', num: '2.5', title: 'Tri-Row Transition Fluency', keys: 'All Letter Rows', goal: '≥ 96% Acc • 35 WPM' },
    ],
  },
  {
    id: 'intermediate',
    levelNumber: 'LEVEL 03',
    name: 'Intermediate',
    title: 'Punctuation, Capitalization & Shift Keys',
    subtitle: 'Master opposite-hand Shift key discipline and symbols',
    description:
      'Eliminate the one-handed Shift habit. Learn balanced opposite-hand Shift discipline (Left Pinky for right keys, Right Pinky for left keys) with comma and period flow.',
    color: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    accentGrad: 'linear-gradient(135deg, #6366F1 0%, #8257FF 100%)',
    icon: '⚡',
    duration: '45 mins',
    lessonsCount: 5,
    benchmarkWpm: 45,
    passThreshold: '≥ 96% Acc • 40 WPM',
    fingerDiscipline: 'Opposite-Hand Shift: Capitalize left keys with Right Shift; right keys with Left Shift.',
    activeKeys: [',', '.', "'", '/', 'shift', 'caps', '?', '!', '"'],
    sampleSequence: ['shift', 'a', ',', 'shift', 'j', '.', "'", '?', 'shift', 't', 'space'],
    lessons: [
      { id: '3.1', num: '3.1', title: 'Opposite-Hand Shift Discipline', keys: 'Shift L / R', goal: '≥ 96% Acc • 35 WPM' },
      { id: '3.2', num: '3.2', title: 'Comma & Period Sentence Rhythms', keys: ',  .', goal: '≥ 96% Acc • 38 WPM' },
      { id: '3.3', num: '3.3', title: 'Apostrophes, Quotes & Question Marks', keys: "\'  \"  ?", goal: '≥ 95% Acc • 38 WPM' },
      { id: '3.4', num: '3.4', title: 'Mixed-Case Capitalization Sprint', keys: 'Capitalized Prose', goal: '≥ 96% Acc • 40 WPM' },
      { id: '3.5', num: '3.5', title: 'Real-World Prose Fluency', keys: 'Full Syntax', goal: '≥ 97% Acc • 45 WPM' },
    ],
  },
  {
    id: 'advanced',
    levelNumber: 'LEVEL 04',
    name: 'Advanced',
    title: 'Number Row & Code Syntax Mastery',
    subtitle: 'Speed drills for numbers 0-9 and programming brackets',
    description:
      'Conquer the number row without looking away from your screen. Build finger reach dexterity for curly braces { }, brackets [ ], parentheticals ( ), and comparison operators.',
    color: '#8257FF',
    glowColor: 'rgba(130, 87, 255, 0.45)',
    accentGrad: 'linear-gradient(135deg, #8257FF 0%, #C084FC 100%)',
    icon: '💻',
    duration: '60 mins',
    lessonsCount: 5,
    benchmarkWpm: 60,
    passThreshold: '≥ 96% Acc • 55 WPM',
    fingerDiscipline: 'Number Row Reaches: 1-5 Left Hand, 6-0 Right Hand. Brackets { } via Right Pinky.',
    activeKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '{', '}', '[', ']', '<', '>', '/', '*'],
    sampleSequence: ['1', '2', '3', '{', '}', '0', '9', '[', ']', '=', '<', '>'],
    lessons: [
      { id: '4.1', num: '4.1', title: 'Left Hand Numbers (1, 2, 3, 4, 5)', keys: '1, 2, 3, 4, 5', goal: '≥ 95% Acc • 45 WPM' },
      { id: '4.2', num: '4.2', title: 'Right Hand Numbers (6, 7, 8, 9, 0)', keys: '6, 7, 8, 9, 0', goal: '≥ 95% Acc • 45 WPM' },
      { id: '4.3', num: '4.3', title: 'Brackets & Code Enclosures { } [ ] ( )', keys: '{ } [ ] ( )', goal: '≥ 95% Acc • 50 WPM' },
      { id: '4.4', num: '4.4', title: 'Programming Operators & Arithmetic', keys: '= + - * / < >', goal: '≥ 96% Acc • 52 WPM' },
      { id: '4.5', num: '4.5', title: 'Code Syntax Sprint (TypeScript / Python)', keys: 'Raw Code', goal: '≥ 97% Acc • 60 WPM' },
    ],
  },
  {
    id: 'professional',
    levelNumber: 'LEVEL 05',
    name: 'Professional',
    title: 'Grandmaster Velocity & Zero-Hesitation',
    subtitle: '100+ WPM benchmarks, sustained stamina and complex prose',
    description:
      'The ultimate typing performance tier. Push beyond ordinary limits with rapid-fire vocabulary, sustained 5-minute endurance sprints, and microsecond latency optimization.',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    accentGrad: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    icon: '👑',
    duration: '90 mins',
    lessonsCount: 5,
    benchmarkWpm: 100,
    passThreshold: '≥ 98% Acc • 100+ WPM',
    fingerDiscipline: 'Full Keyboard Flow: Unconscious tactile autopilot with zero glance down and sub-80ms IKI.',
    activeKeys: ['all'],
    sampleSequence: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    lessons: [
      { id: '5.1', num: '5.1', title: 'High-Frequency Trigraph Sprints', keys: 'the, ing, ion, ent', goal: '≥ 98% Acc • 70 WPM' },
      { id: '5.2', num: '5.2', title: 'Complex Academic Vocabulary', keys: 'Sophisticated Lexicon', goal: '≥ 97% Acc • 75 WPM' },
      { id: '5.3', num: '5.3', title: '3-Minute Continuous Endurance Sprint', keys: 'Sustained Prose', goal: '≥ 98% Acc • 85 WPM' },
      { id: '5.4', num: '5.4', title: '100+ WPM Speed Burst Certification', keys: 'High Velocity', goal: '≥ 98% Acc • 100 WPM' },
      { id: '5.5', num: '5.5', title: 'Typhon Grandmaster Final Benchmark', keys: 'Comprehensive', goal: '≥ 99% Acc • 110 WPM' },
    ],
  },
];

// Mini Keyboard Row Definitions for the Live Visualizer
const MINI_KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'DEL'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
  ['CTRL', 'ALT', 'SPACE', 'ALT', 'FN'],
];

export const MasteryLearningPaths: React.FC = () => {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'console' | 'grid'>('console');
  const [activeGhostKey, setActiveGhostKey] = useState<string | null>(null);
  const [userClickedKey, setUserClickedKey] = useState<string | null>(null);
  const [ghostCadenceWpm, setGhostCadenceWpm] = useState<number>(24);
  const animIndexRef = useRef<number>(0);

  const activeTier = TIERS[selectedIdx];

  // Ghost typing simulation: loops through sample keys for the active tier
  useEffect(() => {
    animIndexRef.current = 0;
    const intervalTime = Math.max(350, Math.floor(60000 / (activeTier.benchmarkWpm * 5)));
    setGhostCadenceWpm(activeTier.benchmarkWpm);

    const interval = setInterval(() => {
      const seq = activeTier.sampleSequence;
      if (seq.length > 0) {
        const nextKey = seq[animIndexRef.current % seq.length];
        setActiveGhostKey(nextKey.toUpperCase());
        animIndexRef.current += 1;

        // Clear after pulse
        setTimeout(() => {
          setActiveGhostKey((prev) => (prev === nextKey.toUpperCase() ? null : prev));
        }, intervalTime * 0.7);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [selectedIdx, activeTier]);

  const isKeyActiveForTier = (keyStr: string): boolean => {
    const k = keyStr.toLowerCase();
    if (activeTier.activeKeys.includes('all')) return true;
    if (activeTier.activeKeys.includes(k)) return true;
    if (k === 'space' && activeTier.id === 'beginner') return true;
    return false;
  };

  const handleKeyClick = (k: string) => {
    setUserClickedKey(k);
    setTimeout(() => {
      setUserClickedKey(null);
    }, 280);
  };

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1280px',
        padding: '3rem 1.5rem 5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* 1. Header with Badge & Gradient Space Grotesk Heading & View Mode Switcher */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <CyberBadge variant="purple" glow>
            STRUCTURED CURRICULUM • 5 CALIBRATED SKILL TIERS
          </CyberBadge>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
            fontWeight: 900,
            color: '#F5F7FF',
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}
        >
          Mastery{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 217, 255, 0.45)',
            }}
          >
            Learning Paths
          </span>
        </h2>

        <p style={{ color: '#A3B2CC', fontSize: '1.05rem', maxWidth: '660px', margin: 0, lineHeight: 1.6 }}>
          Progress through 5 calibrated skill tiers designed to establish authentic muscle memory without looking at your keyboard.
        </p>

        {/* View Mode Switcher: Interactive Console vs 5-Tier Overview Cards */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(10, 20, 40, 0.75)',
            padding: '0.35rem',
            borderRadius: '9999px',
            border: '1px solid rgba(120, 160, 255, 0.2)',
            marginTop: '0.5rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('console')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: viewMode === 'console' ? 'linear-gradient(135deg, #00D9FF, #168BFF)' : 'transparent',
              color: viewMode === 'console' ? '#050B18' : '#A3B2CC',
              boxShadow: viewMode === 'console' ? '0 0 16px rgba(0, 217, 255, 0.4)' : 'none',
            }}
          >
            <span>⚡ Interactive Console</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: viewMode === 'grid' ? 'linear-gradient(135deg, #8257FF, #6366F1)' : 'transparent',
              color: viewMode === 'grid' ? '#FFFFFF' : '#A3B2CC',
              boxShadow: viewMode === 'grid' ? '0 0 16px rgba(130, 87, 255, 0.4)' : 'none',
            }}
          >
            <span>🗂️ 5-Tier Overview</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Horizontal Tier Dock (Always accessible for rapid switching) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem',
          background: 'rgba(10, 20, 40, 0.85)',
          padding: '0.75rem',
          borderRadius: '20px',
          border: '1px solid rgba(120, 160, 255, 0.18)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
        }}
      >
        {TIERS.map((tier, idx) => {
          const isSelected = idx === selectedIdx;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              onMouseEnter={() => setSelectedIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '14px',
                background: isSelected
                  ? `linear-gradient(135deg, ${tier.color}28 0%, rgba(16, 29, 54, 0.98) 100%)`
                  : 'rgba(5, 11, 24, 0.45)',
                border: isSelected ? `2px solid ${tier.color}` : '1.5px solid rgba(120, 160, 255, 0.12)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected
                  ? `0 0 28px ${tier.glowColor}, inset 0 0 16px ${tier.color}25`
                  : 'none',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                textAlign: 'left',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Top Accent Glowing Laser on Active Tab */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '12%',
                    right: '12%',
                    height: '2.5px',
                    borderRadius: '9999px',
                    background: tier.accentGrad,
                    boxShadow: `0 0 14px ${tier.color}`,
                  }}
                />
              )}

              {/* Bottom Connecting Pointer Chevron (▼) pointing directly into the opened console */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: `8px solid ${tier.color}`,
                    filter: `drop-shadow(0 2px 6px ${tier.glowColor})`,
                    zIndex: 20,
                    animation: 'activePointerBounce 1.5s ease-in-out infinite',
                  }}
                />
              )}

              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '11px',
                  background: isSelected ? tier.color : `${tier.color}18`,
                  color: isSelected ? '#050B18' : tier.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  boxShadow: isSelected ? `0 0 18px ${tier.color}` : 'none',
                  transition: 'all 0.25s ease',
                  flexShrink: 0,
                }}
              >
                {tier.icon}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '0.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: isSelected ? tier.color : '#64748B',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tier.levelNumber}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: isSelected ? '#F5F7FF' : '#94A3B8',
                      background: isSelected ? `${tier.color}35` : 'rgba(255, 255, 255, 0.08)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tier.benchmarkWpm}+ WPM
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.96rem',
                    fontWeight: 800,
                    color: isSelected ? '#F5F7FF' : '#A3B2CC',
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tier.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. VIEW MODE A: FEATURED SHOWCASE LEARNING CONSOLE (Master Art Panel 3 Style) */}
      {viewMode === 'console' && (
        <div
          key={activeTier.id}
          style={{
            borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(16, 29, 54, 0.94) 0%, rgba(10, 20, 40, 0.98) 100%)',
            border: `2px solid ${activeTier.color}55`,
            padding: 'clamp(1.5rem, 3vw, 2.75rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            boxShadow: `0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 45px -10px ${activeTier.glowColor}`,
            position: 'relative',
            overflow: 'hidden',
            animation: 'consolePanelOpen 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
            transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
          }}
        >
          {/* Top glowing laser line matching active tier color */}
          <div
            key={`laser-${activeTier.id}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.5px',
              background: `linear-gradient(90deg, transparent 0%, ${activeTier.color} 50%, transparent 100%)`,
              boxShadow: `0 0 24px ${activeTier.color}`,
              animation: 'neonLaserSweep 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* LEFT COLUMN: Tier Title, Curriculum Milestones & CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'consoleSlideFromLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: activeTier.color,
                  background: `${activeTier.color}18`,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: `1px solid ${activeTier.color}40`,
                  letterSpacing: '0.06em',
                }}
              >
                {activeTier.levelNumber}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#A3B2CC', fontWeight: 600 }}>
                {activeTier.subtitle}
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2.3rem)',
                fontWeight: 900,
                color: '#F5F7FF',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {activeTier.title}
            </h3>

            <p style={{ color: '#A3B2CC', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
              {activeTier.description}
            </p>

            {/* Ergonomic Finger Discipline Hint */}
            <div
              style={{
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(120, 160, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.82rem',
                color: '#E2E8F0',
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>🖐️</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', lineHeight: 1.4 }}>
                <strong style={{ color: activeTier.color }}>Ergonomics:</strong> {activeTier.fingerDiscipline}
              </span>
            </div>

            {/* Curriculum Lesson Breakdown (5 Calibrated Milestones) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F5F7FF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Calibrated Drill Milestones ({activeTier.lessonsCount} Drills)
                </span>
                <span style={{ fontSize: '0.72rem', color: activeTier.color, fontFamily: 'var(--font-mono)' }}>
                  Passing: {activeTier.passThreshold}
                </span>
              </div>

              {activeTier.lessons.map((l, mIdx) => (
                <div
                  key={l.id}
                  onClick={() => router.push('/lessons')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    background: 'rgba(5, 11, 24, 0.65)',
                    border: '1px solid rgba(120, 160, 255, 0.12)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: 'drillItemFade 0.3s ease both',
                    animationDelay: `${mIdx * 0.05}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeTier.color;
                    e.currentTarget.style.background = 'rgba(16, 29, 54, 0.9)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.12)';
                    e.currentTarget.style.background = 'rgba(5, 11, 24, 0.65)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: activeTier.color,
                      }}
                    >
                      {l.num}
                    </span>
                    <span style={{ fontWeight: 700, color: '#F5F7FF' }}>{l.title}</span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.74rem',
                      color: activeTier.color,
                      background: `${activeTier.color}18`,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: `1px solid ${activeTier.color}35`,
                    }}
                  >
                    {l.keys}
                  </span>
                </div>
              ))}
            </div>

            {/* Metrics & Action Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(120, 160, 255, 0.14)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Duration
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#F5F7FF' }}>
                    ⏱️ {activeTier.duration}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Benchmark Goal
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: activeTier.color }}>
                    {activeTier.passThreshold}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => router.push('/practice')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem 1.4rem',
                    borderRadius: '12px',
                    background: 'rgba(16, 29, 54, 0.8)',
                    color: '#F5F7FF',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    border: '1px solid rgba(120, 160, 255, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeTier.color;
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.25)';
                    e.currentTarget.style.background = 'rgba(16, 29, 54, 0.8)';
                  }}
                >
                  <span>Quick Practice</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/lessons')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '12px',
                    background: activeTier.accentGrad,
                    color: activeTier.id === 'professional' ? '#FFFFFF' : '#050B18',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 0 24px ${activeTier.glowColor}`,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <span>Start {activeTier.name} Lessons</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Cyber Keyboard Matrix & Typing Animation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              background: 'rgba(5, 11, 24, 0.8)',
              border: '1px solid rgba(120, 160, 255, 0.2)',
              borderRadius: '22px',
              padding: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              animation: 'consoleSlideFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activeTier.color,
                    boxShadow: `0 0 10px ${activeTier.color}`,
                    display: 'inline-block',
                    animation: 'beaconGlow 1.5s infinite ease-in-out',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 800, color: '#F5F7FF' }}>
                  Active Keystroke Matrix
                </span>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: activeTier.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: `${activeTier.color}15`,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  border: `1px solid ${activeTier.color}35`,
                }}
              >
                <span>Ghost Cadence: ~{ghostCadenceWpm} WPM</span>
              </div>
            </div>

            {/* Interactive Mini Keyboard Deck */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                width: '100%',
                userSelect: 'none',
                overflowX: 'auto',
                padding: '0.25rem 0',
              }}
            >
              {MINI_KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: '0.28rem', justifyContent: 'center' }}>
                  {row.map((k, kIdx) => {
                    const isActive = isKeyActiveForTier(k);
                    const isGhostPressed = activeGhostKey === k.toUpperCase();
                    const isUserPressed = userClickedKey === k;

                    let minW = '29px';
                    if (k === 'SPACE') minW = '130px';
                    else if (k === 'SHIFT') minW = '46px';
                    else if (k === 'ENTER' || k === 'CAPS' || k === 'TAB' || k === 'DEL') minW = '40px';

                    return (
                      <button
                        key={kIdx}
                        type="button"
                        onClick={() => handleKeyClick(k)}
                        style={{
                          minWidth: minW,
                          height: '29px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: k.length > 2 ? '0.6rem' : '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: 0,
                          border: isUserPressed || isGhostPressed
                            ? `1.5px solid #FFFFFF`
                            : isActive
                            ? `1px solid ${activeTier.color}`
                            : '1px solid rgba(120, 160, 255, 0.1)',
                          background: isUserPressed || isGhostPressed
                            ? '#FFFFFF'
                            : isActive
                            ? activeTier.accentGrad
                            : 'rgba(16, 29, 54, 0.65)',
                          color: isUserPressed || isGhostPressed
                            ? '#050B18'
                            : isActive
                            ? activeTier.id === 'professional' ? '#FFFFFF' : '#050B18'
                            : '#64748B',
                          boxShadow: isUserPressed || isGhostPressed
                            ? `0 0 20px #FFFFFF, 0 0 30px ${activeTier.color}`
                            : isActive
                            ? `0 0 12px ${activeTier.glowColor}`
                            : 'none',
                          transform: isUserPressed || isGhostPressed ? 'translateY(2px) scale(0.96)' : 'translateY(0) scale(1)',
                          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Keyzone Legend & Ergonomics Tip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(120, 160, 255, 0.12)',
                fontSize: '0.76rem',
                color: '#A3B2CC',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: activeTier.color,
                  }}
                />
                <span>Illuminated keys active for <strong>{activeTier.name}</strong></span>
              </div>
              <span style={{ color: activeTier.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Tier {selectedIdx + 1} of 5
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE B: 5-TIER OVERVIEW CARDS (Premium Glassmorphic Cyber Cards) */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 225px), 1fr))',
            gap: '1.4rem',
          }}
        >
          {TIERS.map((tier, idx) => {
            const isSelected = idx === selectedIdx;
            return (
              <div
                key={tier.id}
                className="learning-path-card"
                style={{
                  '--card-accent-color': tier.color,
                  '--card-glow-color': tier.glowColor,
                  '--card-accent-grad': tier.accentGrad,
                  border: isSelected ? `1.5px solid ${tier.color}` : undefined,
                  boxShadow: isSelected ? `0 16px 40px -8px ${tier.glowColor}` : undefined,
                } as React.CSSProperties}
                onClick={() => {
                  setSelectedIdx(idx);
                  setViewMode('console');
                }}
              >
                {/* Top Row: Icon Pod + Level Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    className="tier-icon-pod"
                    style={{
                      background: `${tier.color}18`,
                      border: `1px solid ${tier.color}45`,
                      boxShadow: `0 0 16px ${tier.color}25`,
                    }}
                  >
                    <span>{tier.icon}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: tier.color, letterSpacing: '0.06em' }}>
                      {tier.levelNumber}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#A3B2CC', fontWeight: 600 }}>
                      {tier.name}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#F5F7FF',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {tier.title}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#A3B2CC', margin: 0, lineHeight: 1.55 }}>
                    {tier.description}
                  </p>
                </div>

                {/* Key Chips Preview Matrix */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.2rem 0' }}>
                  {tier.activeKeys.slice(0, 7).map((k, kIdx) => (
                    <span key={kIdx} className="tier-key-chip">
                      {k.toUpperCase()}
                    </span>
                  ))}
                  {tier.activeKeys.length > 7 && (
                    <span className="tier-key-chip" style={{ color: tier.color }}>
                      +{tier.activeKeys.length - 7}
                    </span>
                  )}
                </div>

                {/* Benchmark Goal */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(5, 11, 24, 0.5)',
                    border: '1px solid rgba(120, 160, 255, 0.1)',
                    fontSize: '0.72rem',
                  }}
                >
                  <span style={{ color: '#A3B2CC' }}>Benchmark</span>
                  <span style={{ color: tier.color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {tier.benchmarkWpm}+ WPM
                  </span>
                </div>

                {/* Card Footer: Time, Lessons & Action Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(120, 160, 255, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.74rem', color: '#A3B2CC' }}>⏱️ {tier.duration}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(163, 178, 204, 0.7)' }}>{tier.lessonsCount} Lessons</span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: tier.color,
                    }}
                  >
                    <span>Explore</span>
                    <span className="tier-arrow" style={{ transition: 'transform 0.2s ease', display: 'inline-block' }}>
                      →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
