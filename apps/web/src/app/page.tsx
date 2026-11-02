'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { ResultsModal } from '../components/ResultsModal';
import { GuestHistory } from '../components/GuestHistory';
import { CurriculumView } from '../components/CurriculumView';
import { FingerGuide } from '../components/FingerGuide';
import { KeybrResults } from '../components/KeybrResults';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { HeroIllustration } from '../components/HeroIllustration';
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

  const canvasRef = useRef<HTMLDivElement>(null);

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
        hash === '#speed' && tabParam === 'results' ||
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
    // Transition cleanly to dedicated Keybr speed & keyboard heatmap view
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

    if (canvasRef.current) {
      canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Compact Sticky Header */}
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
        {/* Speed Test Main View (Centered Hero Workspace) */}
        {activeTab === 'speed' && (
          <div
            ref={canvasRef}
            style={{
              maxWidth: '1060px',
              width: '100%',
              padding: '1.25rem 1.25rem 2.5rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              margin: '0 auto',
            }}
          >
            {/* Title Section (Bright, Illustrated, Premium Speed Test Hero) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                padding: '0.5rem 0',
                marginBottom: '0.25rem',
              }}
            >
              {/* Left Column: Headline, Value Prop & Feature Chips */}
              <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.22rem 0.8rem',
                    borderRadius: '9999px',
                    background: 'var(--brand-pale-blue)',
                    border: '1px solid var(--brand-blue-border)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--brand-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    width: 'fit-content',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />
                  <span>Next-Gen Touch Typing • Real-Time Telemetry</span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                    margin: 0,
                    lineHeight: 1.12,
                  }}
                >
                  Type Better.{' '}
                  <span
                    style={{
                      background: 'var(--brand-gradient)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Go Further.
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: '0.96rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    maxWidth: '520px',
                    margin: 0,
                  }}
                >
                  Practice your touch typing, track real-time telemetry, and build authentic keyboard dexterity with algorithmic weak-key diagnostics.
                </p>

                {/* 3 Quick Value Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span>⚡</span> 0ms Latency
                  </span>
                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      background: 'var(--academy-purple-bg)',
                      border: '1px solid rgba(128, 87, 232, 0.25)',
                      color: 'var(--academy-purple)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>🎓</span> 25 Academy Lessons
                  </span>
                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
                      background: 'var(--success-bg)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: 'var(--success)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span>🎯</span> Keybr Diagnostics
                  </span>
                </div>
              </div>

              {/* Right Column: Clean Editorial Illustration */}
              <div
                className="hero-illustration-col"
                style={{
                  flex: '0 1 360px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <HeroIllustration />
              </div>
            </div>

            {/* Hero Typing Workspace (Full Width, Centered) */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

              {/* Collapsible Virtual Keyboard & Hands Guide Button & Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowFingerGuide((prev) => !prev)}
                    style={{
                      background: showFingerGuide ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-surface)',
                      border: showFingerGuide ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      color: showFingerGuide ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      padding: '0.32rem 0.95rem',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span>✋</span>
                    <span>{showFingerGuide ? 'Hide Virtual Hands & Keyboard' : 'Show Virtual Hands & Keyboard Guide'}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>{showFingerGuide ? '▲' : '▼'}</span>
                  </button>
                </div>

                {/* Real-time Interactive Finger & Hands Guide */}
                {showFingerGuide && (
                  <div style={{ width: '100%', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <FingerGuide
                      activeChar={activeTargetChar}
                      isDrill={!!activeDrill}
                      onSelectKeyToPractice={(k) => handlePracticeSpecificKeys([k])}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick-Launch 3-Pillar Feature Showcase (Continue Learning, Multiplayer, Diagnostics) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '0.85rem',
                marginTop: '0.5rem',
              }}
            >
              {/* Feature 1: Continue Learning Academy */}
              <div
                onClick={() => setActiveTab('curriculum')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '1rem',
                  padding: '0.9rem 1.15rem',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--academy-purple)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--academy-purple-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--academy-purple)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Touch Typing Academy
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--academy-purple)', fontWeight: 700 }}>
                      Learn →
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0', lineHeight: 1.35 }}>
                    6 stages • 25 lessons with finger guidance
                  </p>
                </div>
              </div>

              {/* Feature 2: Multiplayer Racing Arena */}
              <div
                onClick={() => router.push('/multiplayer')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '1rem',
                  padding: '0.9rem 1.15rem',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--brand-pale-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Multiplayer Arena
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                      Race →
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0', lineHeight: 1.35 }}>
                    Real-time racing tracks & game modes
                  </p>
                </div>
              </div>

              {/* Feature 3: Heatmap & Weak Key Remediation */}
              <div
                onClick={() => setActiveTab('results')}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '1rem',
                  padding: '0.9rem 1.15rem',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--success)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'var(--success-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Heatmap Diagnostics
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>
                      Stats →
                    </span>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0', lineHeight: 1.35 }}>
                    Per-key accuracy matrix & weak-key drills
                  </p>
                </div>
              </div>
            </div>

            {/* Auxiliary 2-Card Row: Touch Typing Academy & Guest History */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
                gap: '1rem',
                alignItems: 'stretch',
                marginTop: '0.5rem',
              }}
            >
              {/* Card 1: Touch Typing Academy */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <AcademyCard
                  progressMap={curriculumProgress}
                  onSelectDrill={handleSelectDrill}
                  activeDrillLessonId={activeDrill?.lesson.id}
                  onExitDrill={handleExitDrill}
                  onOpenFullAcademy={() => setActiveTab('curriculum')}
                />
              </div>

              {/* Card 2: Guest History & Stats */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <GuestHistory
                  sessions={guestSessions}
                  stats={guestStats}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </div>
          </div>
        )}

        {/* Full Academy Curriculum View (Tab) */}
        {activeTab === 'curriculum' && (
          <div style={{ width: '100%', maxWidth: '1200px', padding: '1.5rem 1.5rem 3rem 1.5rem' }}>
            <CurriculumView
              progressMap={curriculumProgress}
              onSelectDrill={handleSelectDrill}
              activeLessonId={activeDrill?.lesson.id}
            />
          </div>
        )}

        {/* Dedicated Keybr Post-Test Results & Speed Keyboard Heatmap View (Tab) */}
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

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
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
