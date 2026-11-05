'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberBadge } from '@/components/ui/CyberBadge';

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050B18' }}>
      {/* Navigation Header */}
      <Header />

      <main style={{ flex: 1, padding: '3rem 1.5rem 5rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {/* =========================================================================
            PANEL 8: ABOUT HERO (Headline, Description, Glowing Cyber Globe with 'T')
           ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            gap: '3rem',
            alignItems: 'center',
            marginBottom: '4rem',
          }}
        >
          {/* Left Column: Mission & About Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <CyberBadge variant="purple" glow>
              ABOUT TYPING TYPHON
            </CyberBadge>

            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
                fontWeight: 900,
                color: '#F5F7FF',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Master Your Typing.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Elevate Velocity.
              </span>
            </h1>

            <p style={{ color: '#A3B2CC', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
              Typing Typhon is designed to help you improve your typing speed, accuracy, and confidence through interactive lessons, engaging challenges, and real-time telemetry analytics.
            </p>

            <p style={{ color: '#A3B2CC', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Created under the vision of Emperor Smart Solutions, Typing Typhon merges high-performance web engineering with cognitive typing ergonomics. Unlike traditional typing tutors with generic tests and simulated metrics, Typing Typhon evaluates every keystroke with microsecond precision.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <Link
                href="/practice"
                style={{
                  padding: '0.85rem 1.8rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
                  color: '#050B18',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 0 25px rgba(0, 217, 255, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Start Practicing</span>
                <span>→</span>
              </Link>

              <Link
                href="/lessons"
                style={{
                  padding: '0.85rem 1.6rem',
                  borderRadius: '12px',
                  background: 'rgba(16, 29, 54, 0.8)',
                  color: '#F5F7FF',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '1px solid rgba(120, 160, 255, 0.25)',
                }}
              >
                Explore Curriculum
              </Link>
            </div>
          </div>

          {/* Right Column: Cyber Globe with Glowing 'T' Logo (Exact Match to Panel 8) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Ambient Background Aura */}
            <div
              style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 217, 255, 0.2) 0%, rgba(130, 87, 255, 0.15) 50%, transparent 75%)',
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />

            {/* Glowing Digital Globe Card */}
            <div
              style={{
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #0A1428 0%, #050B18 80%)',
                border: '2px solid rgba(0, 217, 255, 0.35)',
                boxShadow: '0 0 60px rgba(0, 217, 255, 0.25), inset 0 0 40px rgba(130, 87, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Globe Longitude / Latitude Rings */}
              <div
                style={{
                  position: 'absolute',
                  inset: '20px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(0, 217, 255, 0.2)',
                  animation: 'spin 30s linear infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '45px',
                  borderRadius: '50%',
                  border: '1px solid rgba(130, 87, 255, 0.15)',
                  transform: 'rotate(35deg)',
                }}
              />

              {/* Glowing Gradient 'T' Monogram */}
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 45px rgba(0, 217, 255, 0.65)',
                  zIndex: 2,
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16" />
                  <path d="M12 7v13" />
                  <path d="M9 20h6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PANEL 8: 4 PILLARS (Learn Step by Step, Track Progress, Compete, Achieve)
           ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[
            {
              icon: '📚',
              title: 'Learn Step by Step',
              desc: 'Structured 5-stage academy lessons guiding you from tactile home row anchors to complex code syntax.',
              color: '#00D9FF',
            },
            {
              icon: '📈',
              title: 'Track Progress',
              desc: 'Continuous real-time telemetry measures WPM, net accuracy, finger latency, and stumbling keys.',
              color: '#168BFF',
            },
            {
              icon: '🌐',
              title: 'Compete Globally',
              desc: 'Engage with typists across the world on verified weekly leaderboards and live multiplayer tracks.',
              color: '#8257FF',
            },
            {
              icon: '🏆',
              title: 'Achieve More',
              desc: 'Unlock genuine XP tiers, daily streak badges, and cryptographic touch-typing speed certificates.',
              color: '#F59E0B',
            },
          ].map((pillar, idx) => (
            <CyberCard key={idx} hoverEffect padding="1.75rem 1.5rem">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: `${pillar.color}18`,
                    border: `1px solid ${pillar.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {pillar.icon}
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                  {pillar.title}
                </h3>

                <p style={{ color: '#A3B2CC', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            </CyberCard>
          ))}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
