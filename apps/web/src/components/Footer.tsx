'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(120, 160, 255, 0.18)',
        background: 'rgba(5, 11, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '3rem 1.5rem 1.75rem 1.5rem',
        fontSize: '0.85rem',
        color: '#A3B2CC',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Cyber gradient top border line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00D9FF 30%, #8257FF 70%, transparent)',
        }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Top 4-column footer grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
          }}
        >
          {/* Col 1: Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F5F7FF',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  boxShadow: '0 0 15px rgba(0, 217, 255, 0.45)',
                }}
              >
                T
              </span>
              <span>TYPING TYPHON</span>
            </Link>
            <p style={{ margin: 0, color: '#A3B2CC', fontSize: '0.875rem', lineHeight: 1.6 }}>
              World-class futuristic typing learning and competitive platform. Master accuracy, unlock peak speed, and develop flawless mechanical keyboard dexterity.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.25)', color: '#00D9FF' }}>
                Next-Gen 2.0
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'rgba(130, 87, 255, 0.08)', border: '1px solid rgba(130, 87, 255, 0.25)', color: '#8257FF' }}>
                0ms Telemetry
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: '#F5F7FF', fontSize: '0.95rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link href="/practice" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Typing Practice
              </Link>
              <Link href="/lessons" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Interactive Lessons
              </Link>
              <Link href="/challenges" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Daily Challenges
              </Link>
              <Link href="/leaderboard" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Global Leaderboard
              </Link>
              <Link href="/multiplayer" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Multiplayer Arena
              </Link>
            </div>
          </div>

          {/* Col 3: Resources & Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: '#F5F7FF', fontSize: '0.95rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Analytics & Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link href="/#results" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Per-Key Heatmap
              </Link>
              <Link href="/accuracy" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Accuracy Diagnostics
              </Link>
              <Link href="/profile" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Performance Dashboard
              </Link>
              <Link href="/academy" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                25-Lesson Curriculum
              </Link>
            </div>
          </div>

          {/* Col 4: Legal & Support */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: '#F5F7FF', fontSize: '0.95rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Legal & Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <Link href="/privacy" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: '#A3B2CC', textDecoration: 'none', transition: 'color 0.2s' }}>
                Terms & Conditions
              </Link>
              <span style={{ color: '#A3B2CC' }}>
                Emperor Smart Solutions
              </span>
              <span style={{ color: 'rgba(163, 178, 204, 0.6)', fontSize: '0.75rem' }}>
                typingtyphon.emperorsmartsolutions.com
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div
          style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(120, 160, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'rgba(163, 178, 204, 0.65)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Typing Typhon. All rights reserved. A product of Emperor Smart Solutions.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Zero Tracking Telemetry</span>
            <span>Standard 5-Char WPM Engine</span>
            <span>WebGL 3D Accelerated</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
