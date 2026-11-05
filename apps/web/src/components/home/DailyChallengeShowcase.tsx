'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CyberBadge } from '../ui/CyberBadge';

const FULL_QUOTE = 'Dream bigger, type faster, achieve more with deliberate practice.';

export const DailyChallengeShowcase: React.FC = () => {
  // 1. Live Countdown Timer State (Hours, Minutes, Seconds until next midnight UTC)
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '12',
    minutes: '45',
    seconds: '32',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, nextMidnight.getTime() - now.getTime());

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Animated Typing Simulation for the Quote Box
  const [typedChars, setTypedChars] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && typedChars < FULL_QUOTE.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setTypedChars((prev) => prev + 1);
      }, 45);
    } else if (!isDeleting && typedChars === FULL_QUOTE.length) {
      // Pause at end of quote
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 3500);
    } else if (isDeleting && typedChars > 0) {
      // Backspacing quickly
      timeout = setTimeout(() => {
        setTypedChars((prev) => prev - 2 > 0 ? prev - 2 : 0);
      }, 20);
    } else if (isDeleting && typedChars === 0) {
      // Pause before re-typing
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 800);
    }

    return () => clearTimeout(timeout);
  }, [typedChars, isDeleting]);

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1280px',
        padding: '2rem 1.5rem 4rem 1.5rem',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          borderRadius: '26px',
          background: 'linear-gradient(135deg, rgba(16, 29, 54, 0.94) 0%, rgba(10, 20, 40, 0.98) 100%)',
          border: '1.8px solid rgba(130, 87, 255, 0.35)',
          padding: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: '3rem',
          alignItems: 'center',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.6), 0 0 45px -10px rgba(130, 87, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Glowing Laser Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #8257FF 25%, #00D9FF 50%, #F59E0B 75%, transparent 100%)',
            boxShadow: '0 0 20px rgba(130, 87, 255, 0.6)',
            animation: 'neonLaserSweep 4s ease-in-out infinite alternate',
          }}
        />

        {/* Ambient Radial Background Glow Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(130, 87, 255, 0.22) 0%, transparent 70%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
          }}
        />

        {/* LEFT COLUMN: Daily Quest Telemetry, Typing Simulator & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 1 }}>
          {/* Header Badges: Quest Tag, Live Countdown & Streak Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <CyberBadge variant="purple" glow>
              DAILY MISSION #142 • LIVE
            </CyberBadge>

            {/* Live Ticking Countdown Clock */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(5, 11, 24, 0.65)',
                border: '1px solid rgba(0, 217, 255, 0.35)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.76rem',
                color: '#00D9FF',
                fontWeight: 800,
                boxShadow: '0 0 12px rgba(0, 217, 255, 0.2)',
              }}
            >
              <span>⏱️ Resets in</span>
              <span style={{ color: '#F5F7FF', letterSpacing: '0.04em' }}>
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            </div>

            {/* Streak Multiplier Badge with Animated Flame */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: '#F59E0B',
              }}
            >
              <span style={{ display: 'inline-block', animation: 'flamePulse 1.8s infinite ease-in-out' }}>🔥</span>
              <span>7-DAY STREAK (1.5x XP)</span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.85rem, 3vw, 2.4rem)',
                fontWeight: 900,
                color: '#F5F7FF',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
              }}
            >
              Today&apos;s High-Speed{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 35px rgba(0, 217, 255, 0.4)',
                }}
              >
                Sprint Challenge
              </span>
            </h2>
            <p style={{ color: '#A3B2CC', fontSize: '0.96rem', lineHeight: 1.55, margin: '0.45rem 0 0 0' }}>
              Type the curated passage in 60 seconds with strict character validation. Maintain your streak to unlock the weekly gold champion relic.
            </p>
          </div>

          {/* Sprint Specifications HUD Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: 'rgba(5, 11, 24, 0.6)',
              border: '1px solid rgba(120, 160, 255, 0.15)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Benchmark Speed
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#00D9FF' }}>
                ⚡ ≥ 65 WPM
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Accuracy Goal
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#10B981' }}>
                🎯 ≥ 97.0%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sprint Duration
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#F5F7FF' }}>
                ⏱️ 60 Seconds
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bounty Reward
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#F59E0B' }}>
                💎 +150 XP
              </div>
            </div>
          </div>

          {/* Interactive Live Animated Typing Quote Box */}
          <div
            style={{
              borderRadius: '14px',
              background: 'rgba(5, 11, 24, 0.85)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              padding: '1.15rem 1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 217, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Live Sprint Prompt Preview
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: '#00D9FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D9FF', boxShadow: '0 0 8px #00D9FF' }} />
                Real-Time Cadence: ~74 WPM
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                lineHeight: 1.6,
                color: '#F5F7FF',
                minHeight: '3.2rem',
              }}
            >
              <span>&ldquo;{FULL_QUOTE.slice(0, typedChars)}</span>
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.15em',
                  background: '#00D9FF',
                  verticalAlign: 'text-bottom',
                  marginLeft: '2px',
                  boxShadow: '0 0 8px #00D9FF',
                  animation: 'cursorBlink 1s infinite',
                }}
              />
              <span style={{ opacity: 0.35 }}>{FULL_QUOTE.slice(typedChars)}&rdquo;</span>
            </div>

            {/* Live progress bar under typing quote */}
            <div style={{ width: '100%', height: '4px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(typedChars / FULL_QUOTE.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D9FF, #8257FF)',
                  transition: 'width 0.08s linear',
                  boxShadow: '0 0 10px #00D9FF',
                }}
              />
            </div>
          </div>

          {/* Action Buttons: Launch Challenge Sprint & Rules */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <Link
              href="/challenges"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8257FF 0%, #168BFF 100%)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.94rem',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 0 28px rgba(130, 87, 255, 0.45)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(130, 87, 255, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 0 28px rgba(130, 87, 255, 0.45)';
              }}
            >
              <span>Start Challenge Sprint</span>
              <span>→</span>
            </Link>

            <Link
              href="/practice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.4rem',
                borderRadius: '12px',
                background: 'rgba(16, 29, 54, 0.8)',
                color: '#A3B2CC',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(120, 160, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F5F7FF';
                e.currentTarget.style.borderColor = '#00D9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#A3B2CC';
                e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.2)';
              }}
            >
              <span>Warmup Drill</span>
            </Link>

            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
              Instant verification • Anti-cheat secured
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Holographic Trophy Arena & Weekly Tournament Series */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.5rem',
            zIndex: 1,
            position: 'relative',
          }}
        >
          {/* Holographic Arena with Rotating Orbital Rings */}
          <div
            style={{
              position: 'relative',
              width: '200px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer Rotating Energy Ring (Clockwise) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1.5px dashed rgba(245, 158, 11, 0.45)',
                animation: 'ringRotateClockwise 20s linear infinite',
              }}
            />

            {/* Inner Counter-Rotating Energy Ring (Counter-Clockwise) */}
            <div
              style={{
                position: 'absolute',
                inset: '12px',
                borderRadius: '50%',
                border: '1.5px dotted rgba(0, 217, 255, 0.55)',
                animation: 'ringRotateCounter 14s linear infinite',
              }}
            />

            {/* Center Glowing Holographic Trophy Disc with Floating Levitation */}
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(16, 29, 54, 0.9) 70%)',
                border: '2px solid rgba(245, 158, 11, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4.2rem',
                userSelect: 'none',
                animation: 'trophyLevitate 4s ease-in-out infinite, goldGlowPulse 3s infinite ease-in-out',
                position: 'relative',
                zIndex: 2,
              }}
            >
              🏆
            </div>

            {/* Floating Sparkle Particles */}
            <span
              style={{
                position: 'absolute',
                top: '15px',
                right: '25px',
                fontSize: '1rem',
                animation: 'flamePulse 2.2s infinite ease-in-out',
              }}
            >
              ✨
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                fontSize: '0.85rem',
                animation: 'flamePulse 1.8s infinite ease-in-out 0.5s',
              }}
            >
              ⚡
            </span>
          </div>

          {/* Trophy Header & Season Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                letterSpacing: '0.08em',
              }}
            >
              SEASON 04 • GOLD CHAMPION RELIC
            </span>

            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#F5F7FF',
                margin: 0,
              }}
            >
              Weekly Trophy Tournament
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#A3B2CC', maxWidth: '340px', margin: 0, lineHeight: 1.5 }}>
              Compete on weekly sprint tracks, climb the global tier ranks, and display verified typing credentials on your public profile.
            </p>
          </div>

          {/* Mini Top-3 Podium Preview */}
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'rgba(5, 11, 24, 0.7)',
              border: '1px solid rgba(120, 160, 255, 0.16)',
              borderRadius: '14px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              <span>Top Racers Today</span>
              <span style={{ color: '#00D9FF' }}>2,419 Racers</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>🥇</span>
                <span style={{ fontWeight: 700, color: '#F5F7FF' }}>Zephyr</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#00D9FF' }}>134 WPM</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>🥈</span>
                <span style={{ fontWeight: 700, color: '#F5F7FF' }}>CyberViper</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#A3B2CC' }}>128 WPM</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>🥉</span>
                <span style={{ fontWeight: 700, color: '#F5F7FF' }}>NeonTyper</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#F59E0B' }}>122 WPM</span>
            </div>
          </div>

          {/* Quick link to leaderboard */}
          <Link
            href="/leaderboard"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#00D9FF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span>View Full Global Leaderboard</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

