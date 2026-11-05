'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberBadge } from '@/components/ui/CyberBadge';
import Link from 'next/link';

export default function ChallengesPage() {
  const [activeCategory, setActiveCategory] = useState<'daily' | 'weekly' | 'speed' | 'accuracy'>('daily');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary, #050B18)' }}>
      <Header activeTab="challenges" />

      <main style={{ flex: 1, padding: '2rem 1.25rem 3rem 1.25rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {/* Top Header & Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
              <CyberBadge variant="purple">DAILY MISSION</CyberBadge>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                color: '#F5F7FF',
                fontFamily: 'var(--font-heading), var(--font-sans)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Daily Typing Challenge
            </h1>
            <p style={{ color: 'var(--text-secondary, #A3B2CC)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
              Complete today's challenge and earn rewards to level up your profile!
            </p>
          </div>

          {/* Countdown Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(16, 29, 54, 0.8)',
              border: '1px solid rgba(120, 160, 255, 0.25)',
              padding: '0.65rem 1.15rem',
              borderRadius: '14px',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.15)',
            }}
          >
            <div style={{ fontSize: '1.25rem' }}>⏱</div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Time Left
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00D9FF' }}>
                12:45:32
              </div>
            </div>
          </div>
        </div>

        {/* Featured Daily Challenge Card (Panel 4) */}
        <CyberCard
          accentBorder="cyan"
          padding="2rem"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 29, 54, 0.95) 0%, rgba(10, 20, 40, 0.95) 100%)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Golden Trophy Emblem */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(16, 29, 54, 0) 70%)',
                border: '2px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
                flexShrink: 0,
              }}
            >
              🏆
            </div>

            {/* Challenge Content */}
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#00D9FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Type this paragraph in 60 seconds:
              </div>
              <blockquote
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-heading), var(--font-sans)',
                  color: '#F5F7FF',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 600,
                  fontStyle: 'italic',
                }}
              >
                “Dream bigger, type faster, achieve more. Precision and speed are forged through deliberate daily practice.”
              </blockquote>

              <div style={{ marginTop: '0.5rem' }}>
                <Link
                  href="/practice"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading), var(--font-sans)',
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    boxShadow: '0 0 25px rgba(22, 139, 255, 0.5)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Start Challenge →</span>
                </Link>
              </div>
            </div>

            {/* Rewards Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                minWidth: '200px',
                padding: '1.25rem',
                borderRadius: '14px',
                background: 'rgba(5, 11, 24, 0.7)',
                border: '1px solid rgba(120, 160, 255, 0.18)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                Challenge Rewards
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>⭐</span> +100 XP
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00D9FF', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>🎖</span> Achievement Badge
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A78BFA', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>🔥</span> Daily Streak +1
              </div>
            </div>
          </div>
        </CyberCard>

        {/* Challenge Category Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {(['daily', 'weekly', 'speed', 'accuracy'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                background: activeCategory === cat ? 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)' : 'rgba(16, 29, 54, 0.8)',
                border: activeCategory === cat ? '1px solid #00D9FF' : '1px solid rgba(120, 160, 255, 0.18)',
                color: activeCategory === cat ? '#050B18' : 'var(--text-secondary, #A3B2CC)',
                fontWeight: 700,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-heading), var(--font-sans)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'daily' && '⚡ Daily'}
              {cat === 'weekly' && '🏆 Weekly'}
              {cat === 'speed' && '🚀 Speed'}
              {cat === 'accuracy' && '🎯 Accuracy'}
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

