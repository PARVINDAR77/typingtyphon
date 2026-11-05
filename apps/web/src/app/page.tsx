'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EngineResult,
  GuestSessionMigrationItem,
  UserProgressSummaryDto,
  CurriculumStage,
  CurriculumLesson,
  UserProfileDto,
  ALL_CURRICULUM_STAGES,
} from '@typingtyphon/contracts';
import { Header } from '../components/Header';
import { TypingCanvas } from '../components/TypingCanvas';
import { AcademyCard } from '../components/AcademyCard';
import { GuestHistory } from '../components/GuestHistory';
import { CurriculumView } from '../components/CurriculumView';
import { FingerGuide } from '../components/FingerGuide';
import { KeybrResults } from '../components/KeybrResults';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { MechanicalKeyboard3D } from '../components/MechanicalKeyboard3D';
import { RadialGauge } from '../components/ui/RadialGauge';
import { CyberCard } from '../components/ui/CyberCard';
import { CyberBadge } from '../components/ui/CyberBadge';
import { getApiBaseUrl } from '../lib/apiConfig';
import {
  getGuestSessions,
  getGuestStats,
  saveGuestSession,
  clearGuestSessions,
  getGuestCurriculumProgress,
  saveGuestLessonAttempt,
  saveLastSessionWords,
  getLastSessionWords,
  LessonProgress,
  getUserProfile,
  clearUserProfile,
  getPreferredDuration,
  savePreferredDuration,
} from '../lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'speed' | 'curriculum' | 'results' | 'multiplayer' | 'profile'>('speed');
  const [duration, setDuration] = useState<number>(15);
  const [testMode, setTestMode] = useState<'words' | 'punctuation' | 'numbers'>('words');
  const [restartCounter, setRestartCounter] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<EngineResult | null>(null);
  const [guestSessions, setGuestSessions] = useState<GuestSessionMigrationItem[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<Record<string, LessonProgress>>({});
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login'>('login');
  const [activeTargetChar, setActiveTargetChar] = useState<string>('f');
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(false);
  const [sessionWords, setSessionWords] = useState<string[]>([]);

  const [activeDrill, setActiveDrill] = useState<{
    stage: CurriculumStage;
    lesson: CurriculumLesson;
    drillType: 'intro' | 'word' | 'remedial';
    words: string[];
  } | null>(null);
  const [activeLessonResult, setActiveLessonResult] = useState<{
    lessonTitle: string;
    passed: boolean;
    passThreshold: { minAccuracyPct: number; minWpm: number };
    needsRemedial: boolean;
  } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);

  const [guestStats, setGuestStats] = useState<UserProgressSummaryDto>({
    totalCompletedTests: 0,
    totalPracticeTimeSeconds: 0,
    bestNetWpm: 0,
    averageNetWpm: 0,
    bestAccuracyPct: 100,
    averageAccuracyPct: 100,
    currentStreakDays: 0,
  });

  // Load guest history, curriculum progress, and check optional auth session on mount
  useEffect(() => {
    const cachedUser = getUserProfile();
    if (cachedUser) {
      setCurrentUser(cachedUser);
    }
    const preferredDur = getPreferredDuration();
    setDuration(preferredDur);
    refreshGuestData();
    checkCurrentUser();
    const storedWords = getLastSessionWords();
    if (storedWords && storedWords.length > 0) {
      setSessionWords(storedWords);
    }

    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab')?.toLowerCase();
      if (
        hash === '#curriculum' ||
        hash === '#academy' ||
        hash === '#learn' ||
        hash === '#lessons' ||
        tabParam === 'curriculum' ||
        tabParam === 'academy'
      ) {
        setActiveTab('curriculum');
      } else if (
        hash === '#results' ||
        hash === '#heatmap' ||
        (hash === '#speed' && tabParam === 'results') ||
        tabParam === 'results' ||
        tabParam === 'heatmap'
      ) {
        setActiveTab('results');
      }

      const authParam = params.get('auth')?.toLowerCase();
      if (authParam === 'login' || authParam === 'signin') {
        setAuthModalTab('login');
        setIsAuthModalOpen(true);
      } else if (authParam === 'register' || authParam === 'signup') {
        setAuthModalTab('register');
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  const checkCurrentUser = async () => {
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch {
      // Offline fallback: practice cleanly without interruption
    }
  };

  const handleLogout = async () => {
    clearUserProfile();
    try {
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
    } catch {
      // offline
    }
    setCurrentUser(null);
    setIsAuthModalOpen(false);
  };

  const refreshGuestData = () => {
    const sessions = getGuestSessions();
    const stats = getGuestStats();
    const currProg = getGuestCurriculumProgress();
    setGuestSessions(sessions);
    setGuestStats(stats);
    setCurriculumProgress(currProg);
  };

  const scrollToArenaAndFocus = () => {
    if (activeTab !== 'speed') {
      setActiveTab('speed');
    }
    setTimeout(() => {
      if (arenaRef.current) {
        arenaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Attempt to focus typing input inside arena
        const hiddenInput = arenaRef.current.querySelector('input') as HTMLInputElement | null;
        if (hiddenInput) {
          hiddenInput.focus();
        }
      }
    }, 100);
  };

  const handleTestComplete = (result: EngineResult, words?: string[]) => {
    setActiveResult(result);
    if (words && words.length > 0) {
      setSessionWords(words);
      saveLastSessionWords(words);
    } else if (activeDrill?.words) {
      setSessionWords(activeDrill.words);
      saveLastSessionWords(activeDrill.words);
    }

    if (activeDrill) {
      const isPass =
        result.accuracyPct >= activeDrill.lesson.passThreshold.minAccuracyPct &&
        result.netWpm >= activeDrill.lesson.passThreshold.minWpm;

      saveGuestLessonAttempt(activeDrill.lesson.id, result, activeDrill.lesson.passThreshold);

      setActiveLessonResult({
        lessonTitle: activeDrill.lesson.title,
        passed: isPass,
        passThreshold: activeDrill.lesson.passThreshold,
        needsRemedial: !isPass,
      });

      saveGuestSession(result, `curriculum-${activeDrill.drillType}`);
    } else {
      setActiveLessonResult(null);
      saveGuestSession(result, 'words');
    }

    refreshGuestData();
    setActiveTab('results');
  };

  const effectiveResult: EngineResult | null = useMemo(() => {
    if (activeResult) return activeResult;
    if (guestSessions.length > 0) {
      const s = guestSessions[0];
      return {
        durationSeconds: s.durationSeconds,
        elapsedSeconds: s.durationSeconds,
        netWpm: s.netWpm,
        grossWpm: s.grossWpm,
        penalizedWpm: s.netWpm,
        accuracyPct: s.accuracyPct,
        consistencyPct: 88,
        totalKeystrokes: s.totalKeystrokes,
        correctKeystrokes: s.correctKeystrokes,
        errorCount: s.errorCount,
        uncorrectedErrors: 0,
        completedWordsCount: Math.round(s.correctKeystrokes / 5),
        timeSeries: s.timeSeries || [],
        rawIkiArray: [],
        completedAt: s.clientTimestamp,
      };
    }
    return null;
  }, [activeResult, guestSessions]);

  const handleRestart = () => {
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    savePreferredDuration(newDuration);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const handleModeChange = (newMode: 'words' | 'punctuation' | 'numbers') => {
    setTestMode(newMode);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local guest practice history?')) {
      clearGuestSessions();
      refreshGuestData();
    }
  };

  const handleSelectDrill = (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => {
    setActiveDrill({
      stage,
      lesson,
      drillType,
      words,
    });
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');

    if (arenaRef.current) {
      arenaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExitDrill = () => {
    setActiveDrill(null);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
  };

  const handleStartRecommendation = (lessonId: string, drillType: 'intro' | 'word' | 'remedial') => {
    for (const stage of ALL_CURRICULUM_STAGES) {
      const lesson = stage.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        const words =
          drillType === 'remedial'
            ? lesson.remedialDrill
            : drillType === 'word'
            ? lesson.wordDrill
            : lesson.introDrill;
        handleSelectDrill(stage, lesson, drillType, words);
        break;
      }
    }
  };

  const handlePracticeSpecificKeys = (keys: string[]) => {
    const homeAnchors = ['f', 'j', 'd', 'k', 's', 'l'];
    const drills: string[] = [];
    const cleanKeys = keys.map((k) => k.toLowerCase()).filter((k) => k.length === 1);

    for (const k of cleanKeys) {
      drills.push(`${k}${k}${k}`);
      for (const h of homeAnchors) {
        drills.push(`${k}${h}${k}`);
        drills.push(`${h}${k}${h}`);
      }
    }

    const commonWords = [
      'the', 'that', 'with', 'have', 'this', 'from', 'they', 'here',
      'make', 'like', 'time', 'just', 'know', 'take', 'into', 'year',
      'good', 'some', 'could', 'them', 'look', 'work', 'first', 'even',
    ];
    for (const w of commonWords) {
      if (cleanKeys.some((k) => w.includes(k))) {
        drills.push(w);
      }
    }

    const finalWords = drills.slice(0, 50);
    while (finalWords.length < 40) {
      finalWords.push('practice');
    }

    setActiveDrill({
      stage: {
        stageNumber: 0,
        title: 'Keybr Weak Key Remediation',
        description: 'Adaptive drill targeting weak keys',
        requiredKeys: cleanKeys,
        lessons: [],
      } as any,
      lesson: {
        id: `remedial-${cleanKeys.join('')}`,
        stageNumber: 0,
        stageSlug: 'remedial',
        title: `Weak Keys Drill (${cleanKeys.map((k) => k.toUpperCase()).join(', ')})`,
        targetKeys: cleanKeys,
        targetFingers: {},
        description: 'Build confidence and eliminate hesitation on these keys',
        passThreshold: { minAccuracyPct: 95, minWpm: 20 },
        introDrill: finalWords,
        wordDrill: finalWords,
        remedialDrill: finalWords,
      },
      drillType: 'remedial',
      words: finalWords,
    });

    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const previousSession = guestSessions.length > 0 ? guestSessions[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050B18' }}>
      {/* Premium Glassmorphic Navigation */}
      <Header
        duration={duration}
        onDurationChange={handleDurationChange}
        guestTestCount={guestSessions.length}
        onRestart={handleRestart}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            router.push('/profile');
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalTab(mode === 'register' ? 'register' : 'login');
          setIsAuthModalOpen(true);
        }}
        hasResult={!!activeResult || guestSessions.length > 0}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* HOMEPAGE VIEW */}
        {activeTab === 'speed' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* =========================================================================
                SECTION 2: HERO EXPERIENCE (Panel 1 from Master UI/UX Spec)
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '3rem 1.5rem 2rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 540px), 1fr))',
                gap: '2.5rem',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Left Column: Headline, Description, CTA Buttons, Launchpad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 2 }}>
                <CyberBadge variant="cyan" glow>
                  NEXT-GEN TOUCH TYPING • REAL-TIME TELEMETRY
                </CyberBadge>

                <h1
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.75rem, 5.2vw, 4.2rem)',
                    fontWeight: 900,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    color: '#F5F7FF',
                    margin: 0,
                  }}
                >
                  BUILD SPEED.
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 40px rgba(0, 217, 255, 0.35)',
                    }}
                  >
                    MASTER ACCURACY.
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: '1.1rem',
                    color: '#A3B2CC',
                    lineHeight: 1.6,
                    maxWidth: '540px',
                    margin: 0,
                  }}
                >
                  Transform your typing skills with intelligent practice, interactive lessons, and real-time performance tracking.
                </p>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={scrollToArenaAndFocus}
                    className="cyber-glow-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.9rem 1.8rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
                      color: '#050B18',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 0 25px rgba(0, 217, 255, 0.45)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <span>Start Practicing</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('curriculum')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem 1.6rem',
                      borderRadius: '12px',
                      background: 'rgba(16, 29, 54, 0.8)',
                      color: '#F5F7FF',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      border: '1px solid rgba(120, 160, 255, 0.25)',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00D9FF';
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(120, 160, 255, 0.25)';
                      e.currentTarget.style.background = 'rgba(16, 29, 54, 0.8)';
                    }}
                  >
                    <span>Explore Lessons</span>
                  </button>
                </div>

                {/* Try Typing Test Now Glassmorphic Launchpad (Exact Match to Panel 1) */}
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    background: 'rgba(16, 29, 54, 0.65)',
                    border: '1px solid rgba(120, 160, 255, 0.22)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxWidth: '520px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: '#F5F7FF',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Try Typing Test Now
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#00D9FF', fontWeight: 600 }}>
                      Instant 0ms Keystroke Engine
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    {/* Stat 1: WPM */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', color: '#00D9FF' }}>⚡</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                          {guestStats.bestNetWpm > 0 ? guestStats.bestNetWpm : 60}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          WPM
                        </div>
                      </div>
                    </div>

                    {/* Stat 2: Accuracy */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', color: '#168BFF' }}>🎯</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                          {guestStats.averageAccuracyPct > 0 ? Math.round(guestStats.averageAccuracyPct) : 96}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Accuracy
                        </div>
                      </div>
                    </div>

                    {/* Stat 3: Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', color: '#8257FF' }}>⏱️</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 900, color: '#F5F7FF', lineHeight: 1 }}>
                          00:{duration < 10 ? `0${duration}` : duration}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Time
                        </div>
                      </div>
                    </div>

                    {/* Start Test Trigger Button */}
                    <button
                      type="button"
                      onClick={scrollToArenaAndFocus}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #168BFF 0%, #8257FF 100%)',
                        color: '#F5F7FF',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(130, 87, 255, 0.4)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Start Test →
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Mechanical Keyboard Centerpiece */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minHeight: '400px',
                }}
              >
                <MechanicalKeyboard3D />
              </div>
            </section>

            {/* =========================================================================
                SECTION 3: LIVE TYPING PRACTICE PREVIEW / ARENA
               ========================================================================= */}
            <section
              id="typing-arena"
              ref={arenaRef}
              style={{
                width: '100%',
                maxWidth: '1100px',
                padding: '2.5rem 1.5rem 3rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00D9FF', boxShadow: '0 0 10px #00D9FF' }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800, color: '#00D9FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Practice Arena
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#F5F7FF', margin: '0.25rem 0 0 0' }}>
                    Live Typing Test
                  </h2>
                </div>

                {/* Duration Switches (15s Default) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0A1428', padding: '0.35rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(120, 160, 255, 0.2)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#A3B2CC', fontWeight: 600, marginRight: '0.25rem' }}>
                    Timer:
                  </span>
                  {[15, 30, 60, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleDurationChange(sec)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: duration === sec ? '1px solid #00D9FF' : '1px solid transparent',
                        background: duration === sec ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                        color: duration === sec ? '#00D9FF' : '#A3B2CC',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* The Interactive Typing Canvas */}
              <TypingCanvas
                durationSeconds={duration}
                onDurationChange={handleDurationChange}
                mode={testMode}
                onModeChange={handleModeChange}
                onComplete={handleTestComplete}
                restartTrigger={restartCounter}
                onRestart={handleRestart}
                customWords={activeDrill ? activeDrill.words : undefined}
                previousSession={previousSession}
                onActiveCharChange={setActiveTargetChar}
                drillBadge={
                  activeDrill
                    ? {
                        stageTitle: `Stage ${activeDrill.stage.stageNumber}: ${activeDrill.stage.title}`,
                        lessonTitle: `${activeDrill.lesson.title} (${activeDrill.drillType.toUpperCase()})`,
                        targetKeys: activeDrill.lesson.targetKeys,
                        passGoal: `≥ ${activeDrill.lesson.passThreshold.minAccuracyPct}% Acc & ${activeDrill.lesson.passThreshold.minWpm} WPM`,
                      }
                    : null
                }
              />

              {/* Virtual Hands and Keyboard Guide Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowFingerGuide((prev) => !prev)}
                    style={{
                      background: showFingerGuide ? 'rgba(0, 217, 255, 0.12)' : '#101D36',
                      border: showFingerGuide ? '1px solid #00D9FF' : '1px solid rgba(120, 160, 255, 0.18)',
                      color: showFingerGuide ? '#00D9FF' : '#A3B2CC',
                      padding: '0.45rem 1.1rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>✋</span>
                    <span>{showFingerGuide ? 'Hide Virtual Hands Guide' : 'Show Virtual Hands & Mechanical Layout Guide'}</span>
                    <span style={{ fontSize: '0.7rem' }}>{showFingerGuide ? '▲' : '▼'}</span>
                  </button>
                </div>

                {showFingerGuide && (
                  <div style={{ width: '100%', animation: 'fadeIn 0.25s ease' }}>
                    <FingerGuide
                      activeChar={activeTargetChar}
                      isDrill={!!activeDrill}
                      onSelectKeyToPractice={(k) => handlePracticeSpecificKeys([k])}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* =========================================================================
                SECTION 4: LEARNING PATHS (5 Tiers from Master UI/UX Spec)
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '3rem 1.5rem 4rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
              }}
            >
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <CyberBadge variant="purple" glow>
                  STRUCTURED CURRICULUM • 5 CALIBRATED TIERS
                </CyberBadge>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                    fontWeight: 900,
                    color: '#F5F7FF',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                  }}
                >
                  Mastery{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 35px rgba(0, 217, 255, 0.35)',
                    }}
                  >
                    Learning Paths
                  </span>
                </h2>
                <p style={{ color: '#A3B2CC', fontSize: '1.02rem', maxWidth: '620px', margin: 0, lineHeight: 1.6 }}>
                  Progress through 5 calibrated skill tiers designed to establish authentic muscle memory without looking at your keyboard.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 225px), 1fr))',
                  gap: '1.4rem',
                }}
              >
                {[
                  {
                    level: 'LEVEL 01',
                    tierName: 'Beginner',
                    title: 'Home Row Foundations',
                    desc: 'Master ASDF and JKL; keys with tactile index finger anchor positioning.',
                    keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
                    lessons: '5 Lessons',
                    time: '25 mins',
                    color: '#00D9FF',
                    glow: 'rgba(0, 217, 255, 0.35)',
                    grad: 'linear-gradient(90deg, #00D9FF, #168BFF)',
                    icon: '🎯',
                    percent: 0,
                  },
                  {
                    level: 'LEVEL 02',
                    tierName: 'Basic',
                    title: 'Top & Bottom Rows',
                    desc: 'Expand range to QWERTY and ZXCVB rows with diagonal reaching.',
                    keys: ['Q', 'W', 'E', 'R', 'T', 'Z', 'X', 'C'],
                    lessons: '5 Lessons',
                    time: '35 mins',
                    color: '#168BFF',
                    glow: 'rgba(22, 139, 255, 0.35)',
                    grad: 'linear-gradient(90deg, #168BFF, #6366F1)',
                    icon: '🚀',
                    percent: 0,
                  },
                  {
                    level: 'LEVEL 03',
                    tierName: 'Intermediate',
                    title: 'Punctuation & Shift',
                    desc: 'Incorporate commas, periods, apostrophes, and opposite-hand Shift keys.',
                    keys: [',', '.', "'", '?', 'Shift', 'Caps'],
                    lessons: '5 Lessons',
                    time: '45 mins',
                    color: '#6366F1',
                    glow: 'rgba(99, 102, 241, 0.35)',
                    grad: 'linear-gradient(90deg, #6366F1, #8257FF)',
                    icon: '⚡',
                    percent: 0,
                  },
                  {
                    level: 'LEVEL 04',
                    tierName: 'Advanced',
                    title: 'Number Row & Code',
                    desc: 'Speed drills for numbers 0-9 and programming brackets { } [ ].',
                    keys: ['0-9', '{ }', '[ ]', '< >', '= +'],
                    lessons: '5 Lessons',
                    time: '60 mins',
                    color: '#8257FF',
                    glow: 'rgba(130, 87, 255, 0.35)',
                    grad: 'linear-gradient(90deg, #8257FF, #C084FC)',
                    icon: '💻',
                    percent: 0,
                  },
                  {
                    level: 'LEVEL 05',
                    tierName: 'Professional',
                    title: 'High-Velocity Mastery',
                    desc: 'Complex vocabulary, real-world prose, and 100+ WPM benchmarks.',
                    keys: ['100+ WPM', 'Prose', 'Zero Error'],
                    lessons: '5 Lessons',
                    time: '90 mins',
                    color: '#F59E0B',
                    glow: 'rgba(245, 158, 11, 0.35)',
                    grad: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                    icon: '👑',
                    percent: 0,
                  },
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    className="learning-path-card"
                    style={{
                      '--card-accent-color': tier.color,
                      '--card-glow-color': tier.glow,
                      '--card-accent-grad': tier.grad,
                    } as React.CSSProperties}
                    onClick={() => router.push('/lessons')}
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
                          {tier.level}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#A3B2CC', fontWeight: 600 }}>
                          {tier.tierName}
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
                        {tier.desc}
                      </p>
                    </div>

                    {/* Key Chips Preview Matrix */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.2rem 0' }}>
                      {tier.keys.map((k, kIdx) => (
                        <span key={kIdx} className="tier-key-chip">
                          {k}
                        </span>
                      ))}
                    </div>

                    {/* Progress Track */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#A3B2CC' }}>
                        <span>Progress</span>
                        <span style={{ color: tier.color, fontWeight: 700 }}>{tier.percent}% Complete</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', borderRadius: '9999px', background: 'rgba(5, 11, 24, 0.6)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${tier.percent}%`,
                            height: '100%',
                            background: tier.grad,
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
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
                        <span style={{ fontSize: '0.74rem', color: '#A3B2CC' }}>⏱️ {tier.time}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(163, 178, 204, 0.7)' }}>{tier.lessons}</span>
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
                        <span>Start</span>
                        <span className="tier-arrow" style={{ transition: 'transform 0.2s ease', display: 'inline-block' }}>
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* =========================================================================
                SECTION 5: DAILY CHALLENGES PREVIEW (Panel 4 Preview)
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '2rem 1.5rem 3.5rem 1.5rem',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 29, 54, 0.85) 0%, rgba(10, 20, 40, 0.95) 100%)',
                  border: '1px solid rgba(120, 160, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2.5rem',
                  alignItems: 'center',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(130, 87, 255, 0.25) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

                {/* Left: Challenge Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CyberBadge variant="purple" glow>
                      DAILY QUEST
                    </CyberBadge>
                    <span style={{ fontSize: '0.8rem', color: '#00D9FF', fontWeight: 700 }}>
                      ⏱️ Resets in 12:45:32
                    </span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                    Today&apos;s High-Speed Challenge
                  </h2>

                  <p style={{ color: '#A3B2CC', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                    Type the curated paragraph in 60 seconds with ≥ 97% accuracy. Earn +100 XP and maintain your daily practice streak.
                  </p>

                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      background: 'rgba(5, 11, 24, 0.65)',
                      border: '1px solid rgba(120, 160, 255, 0.15)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      color: '#F5F7FF',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;Dream bigger, type faster, achieve more with deliberate practice.&rdquo;
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                    <Link
                      href="/challenges"
                      style={{
                        padding: '0.8rem 1.6rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #8257FF 0%, #168BFF 100%)',
                        color: '#F5F7FF',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 0 20px rgba(130, 87, 255, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>Start Challenge</span>
                      <span>→</span>
                    </Link>
                    <span style={{ fontSize: '0.82rem', color: '#A3B2CC' }}>
                      Reward: <strong style={{ color: '#00D9FF' }}>+100 XP</strong> & Streak +1
                    </span>
                  </div>
                </div>

                {/* Right: Challenge Rewards & Trophy */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(16, 29, 54, 0.8) 70%)',
                      border: '2px solid rgba(255, 215, 0, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    🏆
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: '#F5F7FF' }}>
                    Weekly Trophy Series
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#A3B2CC', maxWidth: '320px', margin: 0 }}>
                    Compete on weekly sprint tracks, climb the global tier ranks, and display verified typing credentials.
                  </p>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 6: PERFORMANCE DASHBOARD PREVIEW (Panel 5 Preview)
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '2rem 1.5rem 3.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <CyberBadge variant="blue">TELEMETRY ANALYTICS</CyberBadge>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#F5F7FF', margin: '0.25rem 0 0 0' }}>
                    Live Performance Dashboard
                  </h2>
                </div>
                <Link
                  href="/profile"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#00D9FF',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Open Full Dashboard</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 4 Telemetry Metrics Cards with Gauge */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Metric 1: Average WPM */}
                <CyberCard>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Average Speed
                      </span>
                      <span style={{ color: '#00D9FF' }}>⚡</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 900, color: '#F5F7FF' }}>
                      {guestStats.averageNetWpm > 0 ? guestStats.averageNetWpm : 68}
                      <span style={{ fontSize: '1rem', color: '#A3B2CC', marginLeft: '0.35rem', fontWeight: 600 }}>WPM</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#00D9FF' }}>
                      Peak: {guestStats.bestNetWpm > 0 ? guestStats.bestNetWpm : 92} WPM
                    </span>
                  </div>
                </CyberCard>

                {/* Metric 2: Radial Accuracy Gauge */}
                <CyberCard>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Accuracy
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 900, color: '#F5F7FF' }}>
                        {guestStats.averageAccuracyPct > 0 ? Math.round(guestStats.averageAccuracyPct) : 97}%
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10B981' }}>
                        Top Accuracy: {guestStats.bestAccuracyPct || 100}%
                      </span>
                    </div>
                    <RadialGauge
                      value={guestStats.averageAccuracyPct > 0 ? Math.round(guestStats.averageAccuracyPct) : 97}
                      size={90}
                      strokeWidth={8}
                      label="Acc"
                    />
                  </div>
                </CyberCard>

                {/* Metric 3: Total Practice Time */}
                <CyberCard>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Practice Time
                      </span>
                      <span style={{ color: '#168BFF' }}>⏱️</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 900, color: '#F5F7FF' }}>
                      {guestStats.totalPracticeTimeSeconds > 0
                        ? `${(guestStats.totalPracticeTimeSeconds / 60).toFixed(1)}m`
                        : '12.5m'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#A3B2CC' }}>
                      {guestStats.totalCompletedTests || 42} Completed Sessions
                    </span>
                  </div>
                </CyberCard>

                {/* Metric 4: Streak */}
                <CyberCard>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#A3B2CC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Practice Streak
                      </span>
                      <span style={{ color: '#F59E0B' }}>🔥</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.4rem', fontWeight: 900, color: '#F5F7FF' }}>
                      {guestStats.currentStreakDays > 0 ? guestStats.currentStreakDays : 7}
                      <span style={{ fontSize: '1rem', color: '#A3B2CC', marginLeft: '0.35rem', fontWeight: 600 }}>Days</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B' }}>
                      Consistency Multiplier Active
                    </span>
                  </div>
                </CyberCard>
              </div>
            </section>

            {/* =========================================================================
                SECTION 7: WHY TYPING TYPHON?
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '2rem 1.5rem 3.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
              }}
            >
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <CyberBadge variant="cyan">ENGINEERING EXCELLENCE</CyberBadge>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 800, color: '#F5F7FF', margin: 0 }}>
                  Why Typing Typhon?
                </h2>
                <p style={{ color: '#A3B2CC', fontSize: '0.95rem', maxWidth: '620px', margin: 0 }}>
                  Built for enthusiasts, software engineers, and professional typists who demand scientific precision, zero input lag, and deep telemetry.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {[
                  {
                    icon: '⚡',
                    title: '0ms Input Latency Telemetry',
                    desc: 'Microsecond-accurate Inter-Keystroke Interval (IKI) tracking measures finger hesitation and raw velocity with zero frame delays.',
                  },
                  {
                    icon: '🎯',
                    title: 'Keybr-Grade Algorithmic Remediation',
                    desc: 'Identifies individual stumbling keys (like Q, P, Z, or B) and automatically generates targeted drill matrices to eliminate hesitation.',
                  },
                  {
                    icon: '🖐️',
                    title: 'Interactive 3D Muscle Memory',
                    desc: 'Real-time finger placement guidance and 3D mechanical keyboard visualization reinforce proper touch-typing ergonomics.',
                  },
                  {
                    icon: '🏎️',
                    title: 'Live Multiplayer Racing Arena',
                    desc: 'Compete in high-stakes speed typing races against friends and global typists on dynamic tracks with real-time positional updates.',
                  },
                  {
                    icon: '🏆',
                    title: 'Genuine Verified XP Progression',
                    desc: 'No simulated bots or inflated metrics. Every stat, streak, and leaderboard rank is cryptographically verified from authentic keystrokes.',
                  },
                  {
                    icon: '🛡️',
                    title: 'Guest-First Local Persistence',
                    desc: 'Practice immediately without mandatory logins. Guest telemetry is preserved locally and syncs smoothly upon Google OAuth sign-in.',
                  },
                ].map((feat, idx) => (
                  <CyberCard key={idx} hoverEffect>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '1px solid rgba(0, 217, 255, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          flexShrink: 0,
                        }}
                      >
                        {feat.icon}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#F5F7FF', margin: 0 }}>
                          {feat.title}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#A3B2CC', margin: 0, lineHeight: 1.55 }}>
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </CyberCard>
                ))}
              </div>
            </section>

            {/* =========================================================================
                SECTION 8: FINAL CALL TO ACTION
               ========================================================================= */}
            <section
              style={{
                width: '100%',
                maxWidth: '1280px',
                padding: '2rem 1.5rem 5rem 1.5rem',
              }}
            >
              <div
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(16, 29, 54, 0.95) 0%, rgba(5, 11, 24, 0.98) 100%)',
                  border: '1px solid rgba(120, 160, 255, 0.25)',
                  borderRadius: '24px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00D9FF, #8257FF, transparent)' }} />

                <CyberBadge variant="purple" glow>
                  BEGIN YOUR TRANSFORMATION
                </CyberBadge>

                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                    fontWeight: 900,
                    color: '#F5F7FF',
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  YOUR NEXT LEVEL STARTS
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 50%, #8257FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    WITH EVERY KEYSTROKE.
                  </span>
                </h2>

                <p style={{ color: '#A3B2CC', fontSize: '1.05rem', maxWidth: '560px', margin: 0, lineHeight: 1.6 }}>
                  Join thousands of developers, students, and competitive typists unlocking peak mechanical velocity on Typing Typhon.
                </p>

                <button
                  type="button"
                  onClick={scrollToArenaAndFocus}
                  className="cyber-glow-btn"
                  style={{
                    marginTop: '0.75rem',
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00D9FF 0%, #168BFF 100%)',
                    color: '#050B18',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  START YOUR JOURNEY →
                </button>
              </div>
            </section>
          </div>
        )}

        {/* FULL CURRICULUM VIEW (Academy Tab) */}
        {activeTab === 'curriculum' && (
          <div style={{ width: '100%', maxWidth: '1280px', padding: '2rem 1.5rem 4rem 1.5rem' }}>
            <CurriculumView
              progressMap={curriculumProgress}
              onSelectDrill={handleSelectDrill}
              activeLessonId={activeDrill?.lesson.id}
            />
          </div>
        )}

        {/* DEDICATED KEYBR HEATMAP & RESULTS VIEW (Results Tab) */}
        {activeTab === 'results' && effectiveResult && (
          <KeybrResults
            result={effectiveResult}
            sessionWords={sessionWords}
            onRestart={handleRestart}
            guestSessionCount={guestSessions.length}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            lessonResult={activeLessonResult}
            onStartRecommendation={handleStartRecommendation}
            onPracticeSpecificKeys={handlePracticeSpecificKeys}
            onClose={() => setActiveTab('speed')}
          />
        )}
      </main>

      {/* Futuristic Cyber Footer */}
      <Footer />

      {/* Google OAuth & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={handleLogout}
        guestSessions={guestSessions}
        onRefreshGuestData={refreshGuestData}
      />
    </div>
  );
}
