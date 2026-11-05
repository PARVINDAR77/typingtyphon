'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberBadge } from '@/components/ui/CyberBadge';
import { MechanicalKeyboard3D } from '@/components/MechanicalKeyboard3D';
import { CyberKeyboardDeck } from '@/components/ui/CyberKeyboardDeck';

export default function ExplorerPage() {
  const [activeFinger, setActiveFinger] = useState<string>('all');
  const [activeChar, setActiveChar] = useState<string>('f');

  const FINGER_GUIDE = [
    { name: 'Left Pinky', color: '#10B981', keys: 'Q, A, Z, 1, Tab, Caps, Shift' },
    { name: 'Left Ring', color: '#3B82F6', keys: 'W, S, X, 2' },
    { name: 'Left Middle', color: '#8B5CF6', keys: 'E, D, C, 3' },
    { name: 'Left Index', color: '#F59E0B', keys: 'R, T, F, G, V, B, 4, 5' },
    { name: 'Right Index', color: '#EF4444', keys: 'Y, U, H, J, N, M, 6, 7' },
    { name: 'Right Middle', color: '#8B5CF6', keys: 'I, K, ,, 8' },
    { name: 'Right Ring', color: '#3B82F6', keys: 'O, L, ., 9' },
    { name: 'Right Pinky', color: '#10B981', keys: 'P, ;, /, 0, -, =, [, ], \', Enter' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050B18' }}>
      {/* Global Header */}
      <Header />

      <main style={{ flex: 1, padding: '2.5rem 1.5rem 4rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        {/* =========================================================================
            PANEL 7: 3D KEYBOARD EXPLORER (Title, Interactive 3D Model, Finger Guide)
           ========================================================================= */}
        <div style={{ marginBottom: '2rem' }}>
          <CyberBadge variant="cyan" glow>
            3D ERGONOMIC TELEMETRY
          </CyberBadge>
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
            Explore the Keyboard
          </h1>
          <p style={{ color: '#A3B2CC', fontSize: '1rem', margin: 0 }}>
            Learn key positions, tactile switch ergonomics, and optimal touch-typing finger placement.
          </p>
        </div>

        {/* 2-Column Main Arena (Left: 3D & 2D Deck | Right: Finger Guide Legend) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 650px), 1fr)) 340px',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: 3D Keyboard Scene + 2D Interactive Deck */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 3D Scene Container */}
            <div
              style={{
                borderRadius: '20px',
                background: 'radial-gradient(ellipse at center, rgba(16, 29, 54, 0.8) 0%, rgba(5, 11, 24, 0.95) 100%)',
                border: '1px solid rgba(120, 160, 255, 0.22)',
                padding: '1.5rem',
                minHeight: '380px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}
            >
              <MechanicalKeyboard3D />
            </div>

            {/* 2D Keycaps Deck with Active Highlights */}
            <CyberCard padding="1.5rem">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: '#F5F7FF' }}>
                    Interactive Keystroke Deck
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#00D9FF' }}>
                    Hover over fingers to isolate keys
                  </span>
                </div>
                <CyberKeyboardDeck activeChar={activeChar} highlightedKeys={['a', 'f', 'j', 'g']} />
              </div>
            </CyberCard>
          </div>

          {/* Right Column: Finger Guide Legend matching Panel 7 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CyberCard padding="1.5rem">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                    Finger Guide
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#A3B2CC' }}>8 Zones</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {FINGER_GUIDE.map((finger, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => {
                        const firstKey = finger.keys.split(',')[0].trim().toLowerCase();
                        setActiveChar(firstKey);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        background: 'rgba(10, 20, 40, 0.6)',
                        border: '1px solid rgba(120, 160, 255, 0.12)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: finger.color,
                            boxShadow: `0 0 10px ${finger.color}`,
                          }}
                        />
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: '#F5F7FF' }}>
                          {finger.name}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A3B2CC' }}>
                        {finger.keys.slice(0, 12)}...
                      </span>
                    </div>
                  ))}
                </div>

                {/* Try It Button */}
                <Link
                  href="/practice"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
                    color: '#050B18',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
                  }}
                >
                  <span>Try It</span>
                  <span>→</span>
                </Link>
              </div>
            </CyberCard>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
