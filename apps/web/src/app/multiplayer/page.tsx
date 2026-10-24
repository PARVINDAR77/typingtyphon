'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { RaceEngine, Racer, RaceGameMode, RaceCharState } from '../../engine/RaceEngine';
import { RaceBotManager } from '../../engine/RaceBotManager';
import { RaceTrack } from '../../components/multiplayer/RaceTrack';
import { RaceTypingBox } from '../../components/multiplayer/RaceTypingBox';
import { RacePodiumModal } from '../../components/multiplayer/RacePodiumModal';
import { getRandomPassage, RacePassage } from '../../lib/racePassages';

export default function MultiplayerPage() {
  const [gameMode, setGameMode] = useState<RaceGameMode>('supercar');
  const [passage, setPassage] = useState<RacePassage>(() => getRandomPassage());
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);

  // Countdown & Race State
  const [status, setStatus] = useState<'waiting' | 'countdown' | 'racing' | 'finished'>('countdown');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);

  const engineRef = useRef<RaceEngine | null>(null);
  const botManagerRef = useRef<RaceBotManager | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Reactive state for UI updates
  const [racers, setRacers] = useState<Racer[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [charStates, setCharStates] = useState<RaceCharState[]>(() => passage.text.split('').map((c) => ({ char: c, state: 'untouched' })));
  const [userWpm, setUserWpm] = useState<number>(0);

  // Initialize a fresh race
  const initRace = useCallback((newPassage: RacePassage = getRandomPassage()) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setPassage(newPassage);
    startTimeRef.current = null;
    setActiveIndex(0);
    setUserWpm(0);
    setCharStates(newPassage.text.split('').map((c) => ({ char: c, state: 'untouched' })));

    // User racer setup
    const userVehicleColor =
      gameMode === 'cyberdrift' ? '#38bdf8' : gameMode === 'wordrush' ? '#f59e0b' : '#0ea5e9';

    const userRacer: Racer = {
      id: 'player-user',
      name: 'Pilot You',
      avatarInitials: 'YO',
      avatarColor: '#0ea5e9',
      vehicleColor: userVehicleColor,
      isUser: true,
      progressPct: 0,
      currentCharIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracyPct: 100,
      errorCount: 0,
      rank: 1,
      isFinished: false,
    };

    // Bots setup
    const botManager = new RaceBotManager(newPassage.text.length, 52);
    botManagerRef.current = botManager;
    const initialRacers = [userRacer, ...botManager.getBotRacers()];

    const engine = new RaceEngine(newPassage.text, initialRacers);
    engineRef.current = engine;
    setRacers(engine.getRacers());

    // Start 5-second countdown
    setStatus('countdown');
    setCountdownSeconds(5);
  }, [gameMode]);

  // Countdown timer loop
  useEffect(() => {
    if (status !== 'countdown') return;

    if (countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Countdown reached 0: Start the race!
    setStatus('racing');
    const now = performance.now();
    startTimeRef.current = now;
    if (engineRef.current) {
      engineRef.current.startRace(now);
      setRacers([...engineRef.current.getRacers()]);
    }
  }, [status, countdownSeconds]);

  // Main Race RAF Loop for smooth Bot movement and stats
  useEffect(() => {
    if (status !== 'racing') return;

    const loop = () => {
      if (!startTimeRef.current || !engineRef.current || !botManagerRef.current) return;
      const now = performance.now();
      const elapsedSec = (now - startTimeRef.current) / 1000;

      // Tick bots
      botManagerRef.current.tick(elapsedSec, engineRef.current);
      setRacers([...engineRef.current.getRacers()]);

      // Check if race is finished
      if (engineRef.current.getStatus() === 'finished' || engineRef.current.isUserFinished()) {
        const remainingBots = engineRef.current.getRacers().filter((r) => !r.isFinished);
        if (remainingBots.length === 0) {
          setStatus('finished');
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status]);

  // Handle Keystroke
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (status !== 'racing' || !engineRef.current) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        engineRef.current.handleBackspace();
        setActiveIndex(engineRef.current.getUserIndex());
        setCharStates([...engineRef.current.getCharStates()]);
        setRacers([...engineRef.current.getRacers()]);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const res = engineRef.current.handleKeystroke(e.key);
        setActiveIndex(engineRef.current.getUserIndex());
        setCharStates([...engineRef.current.getCharStates()]);
        const updatedRacers = [...engineRef.current.getRacers()];
        setRacers(updatedRacers);

        const userRacer = updatedRacers.find((r) => r.isUser);
        if (userRacer) {
          setUserWpm(userRacer.wpm);
        }

        if (res.finished) {
          // If user finished, let bots run for a few moments or show finish
          setTimeout(() => {
            setStatus('finished');
          }, 800);
        }
      }
    },
    [status]
  );

  // Check URL room param for private party invite
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) {
        setPartyCode(room.toUpperCase());
      }
    }
    initRace();
  }, [initRace]);

  const handleCreateParty = () => {
    const code = `TYPHON-${Math.floor(100 + Math.random() * 900)}`;
    setPartyCode(code);
    setShowPartyModal(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/multiplayer?room=${partyCode}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  };

  const handleModeChange = (newMode: RaceGameMode) => {
    setGameMode(newMode);
    initRace();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation Bar with 'Multiplayer' active */}
      <Header
        activeTab="multiplayer"
        duration={60}
        onDurationChange={() => {}}
        guestTestCount={0}
        onRestart={() => initRace()}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '0.85rem 1.25rem 2rem 1.25rem' }}>
        <div style={{ maxWidth: '1080px', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0 auto' }}>
          
          {/* Compact Integrated Title & Sub-Toolbar Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.65rem',
              background: 'var(--bg-surface)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
              width: '100%',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, #38bdf8, #6366f1, transparent)' }} />
            {/* Title / Description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingLeft: '0.35rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                🏁 Multiplayer <span style={{ color: '#38bdf8' }}>Arena</span>
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                • Type fast to accelerate your vehicle
              </span>
            </div>

            {/* Game Mode Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {[
                { id: 'supercar', name: '🏎️ Supercar' },
                { id: 'cyberdrift', name: '🚀 Cyber Drift' },
                { id: 'wordrush', name: '⚡ Word Rush' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModeChange(m.id as RaceGameMode)}
                  style={{
                    background: gameMode === m.id ? 'var(--brand-primary)' : 'transparent',
                    border: gameMode === m.id ? '1px solid var(--brand-cyan)' : '1px solid transparent',
                    color: gameMode === m.id ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: '9999px',
                    padding: '0.22rem 0.65rem',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: gameMode === m.id ? '0 0 10px rgba(14, 165, 233, 0.4)' : 'none',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Matchmaking / Private Party Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {partyCode ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                    borderRadius: '9999px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  <span>Room: {partyCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateParty}
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>👥</span>
                  <span>Private Party</span>
                </button>
              )}

              {/* Restart Race */}
              <button
                type="button"
                onClick={() => initRace()}
                title="Restart with new passage"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>
          </div>

          {/* 4-Lane Real-time Interactive Racing Track */}
          <RaceTrack racers={racers} mode={gameMode} userWpm={userWpm} />

          {/* Keybr-Style Typing Passage Arena with Countdown */}
          <RaceTypingBox
            charStates={charStates}
            activeIndex={activeIndex}
            onKeyDown={handleKeyDown}
            status={status}
            countdownSeconds={countdownSeconds}
            source={passage.source}
            zoomLevel={zoomLevel}
          />

          {/* Shortcut Guidance Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              padding: '0 0.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <kbd>Backspace</kbd>
                <span>correct typos</span>
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <kbd>Tab</kbd>
                <span>restart race</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Real-time instant matchmaking active</span>
            </div>
          </div>
        </div>
      </main>

      {/* Post-Race Podium & Trophies Celebration Modal */}
      {status === 'finished' && (
        <RacePodiumModal racers={racers} onPlayAgain={() => initRace()} />
      )}

      {/* Private Party Invite Modal */}
      {showPartyModal && partyCode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 24, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1.25rem',
              padding: '2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: '2rem' }}>🏁</div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 800 }}>
              Private Party Room Created!
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Share this party link with your friends to race head-to-head on the track:
            </p>
            <div
              style={{
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'var(--brand-primary)',
                wordBreak: 'break-all',
              }}
            >
              {typeof window !== 'undefined' ? `${window.location.origin}/multiplayer?room=${partyCode}` : partyCode}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  background: 'var(--brand-primary)',
                  border: 'none',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  padding: '0.65rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                {copiedLink ? 'Copied to Clipboard!' : 'Copy Invite Link'}
              </button>
              <button
                type="button"
                onClick={() => setShowPartyModal(false)}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '9999px',
                  color: 'var(--text-secondary)',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
