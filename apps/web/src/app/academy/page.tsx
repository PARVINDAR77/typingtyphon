'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ALL_CURRICULUM_STAGES,
  CurriculumStage,
  CurriculumLesson,
  EngineResult,
  findLessonById,
} from '@typingtyphon/contracts';
import { Header } from '@/components/Header';
import { CurriculumView } from '@/components/CurriculumView';
import { TypingCanvas } from '@/components/TypingCanvas';
import { FingerGuide } from '@/components/FingerGuide';
import { Footer } from '@/components/Footer';
import {
  getGuestCurriculumProgress,
  saveGuestLessonAttempt,
  recordKeyStats,
  LessonProgress,
} from '@/lib/storage';

export default function AcademyPage() {
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [activeDrill, setActiveDrill] = useState<{
    stage: CurriculumStage;
    lesson: CurriculumLesson;
    drillType: 'intro' | 'word' | 'remedial';
    words: string[];
  } | null>(null);

  const [activeLessonResult, setActiveLessonResult] = useState<{
    lessonTitle: string;
    passed: boolean;
    accuracyPct: number;
    netWpm: number;
    errors: number;
    passThreshold: { minAccuracyPct: number; minWpm: number };
    nextLesson: { stage: CurriculumStage; lesson: CurriculumLesson } | null;
  } | null>(null);

  const [activeTargetChar, setActiveTargetChar] = useState<string>('f');
  const [showKeyboardGuide, setShowKeyboardGuide] = useState<boolean>(true);
  const [restartCounter, setRestartCounter] = useState<number>(0);

  const drillContainerRef = useRef<HTMLDivElement>(null);

  // Load progress on mount
  useEffect(() => {
    const p = getGuestCurriculumProgress();
    setProgressMap(p);
  }, []);

  // Handle drill selection from CurriculumView
  const handleSelectDrill = (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => {
    setActiveDrill({ stage, lesson, drillType, words });
    setActiveLessonResult(null);
    setRestartCounter((c) => c + 1);

    // Smooth scroll to drill area
    setTimeout(() => {
      drillContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Handle drill test completion
  const handleCompleteDrill = (result: EngineResult) => {
    if (!activeDrill) return;

    recordKeyStats(result);

    const { lesson, stage } = activeDrill;
    const passed =
      result.accuracyPct >= lesson.passThreshold.minAccuracyPct &&
      result.netWpm >= lesson.passThreshold.minWpm;

    // Save attempt and update local state
    saveGuestLessonAttempt(lesson.id, result, lesson.passThreshold);
    setProgressMap(getGuestCurriculumProgress());

    // Determine next sequential lesson in curriculum
    let nextItem: { stage: CurriculumStage; lesson: CurriculumLesson } | null = null;
    const currentLessonIdx = stage.lessons.findIndex((l) => l.id === lesson.id);
    if (currentLessonIdx !== -1 && currentLessonIdx < stage.lessons.length - 1) {
      nextItem = { stage, lesson: stage.lessons[currentLessonIdx + 1] };
    } else {
      const nextStageIdx = ALL_CURRICULUM_STAGES.findIndex((s) => s.stageNumber === stage.stageNumber) + 1;
      if (nextStageIdx < ALL_CURRICULUM_STAGES.length) {
        nextItem = {
          stage: ALL_CURRICULUM_STAGES[nextStageIdx],
          lesson: ALL_CURRICULUM_STAGES[nextStageIdx].lessons[0],
        };
      }
    }

    setActiveLessonResult({
      lessonTitle: lesson.title,
      passed,
      accuracyPct: result.accuracyPct,
      netWpm: result.netWpm,
      errors: result.errorCount,
      passThreshold: lesson.passThreshold,
      nextLesson: nextItem,
    });
  };

  const handleExitDrill = () => {
    setActiveDrill(null);
    setActiveLessonResult(null);
  };

  const handleNextLesson = () => {
    if (!activeLessonResult?.nextLesson) return;
    const { stage, lesson } = activeLessonResult.nextLesson;
    handleSelectDrill(stage, lesson, 'intro', lesson.introDrill);
  };

  const handleRetryCurrentDrill = () => {
    if (!activeDrill) return;
    setActiveLessonResult(null);
    setRestartCounter((c) => c + 1);
  };

  const totalLessons = ALL_CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const passedLessonsCount = Object.values(progressMap).filter((p) => p.passed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Shared Global Header */}
      <Header
        activeTab="curriculum"
        duration={60}
        onDurationChange={() => {}}
        guestTestCount={passedLessonsCount}
        onRestart={() => setRestartCounter((c) => c + 1)}
      />

      {/* Main Academy Body */}
      <main style={{ flex: 1, padding: '1.25rem 1.25rem 3rem 1.25rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ACTIVE DRILL PRACTICE ZONE */}
          {activeDrill && (
            <div
              ref={drillContainerRef}
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--brand-primary)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              {/* Drill Banner Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        background: 'rgba(56, 189, 248, 0.18)',
                        color: '#0284c7',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        padding: '0.12rem 0.55rem',
                        borderRadius: '9999px',
                      }}
                    >
                      Stage {activeDrill.stage.stageNumber}: {activeDrill.stage.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: 'rgba(139, 92, 246, 0.18)',
                        color: '#7c3aed',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        padding: '0.12rem 0.55rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {activeDrill.drillType.toUpperCase()} DRILL
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {activeDrill.lesson.title}
                  </h2>
                </div>

                {/* Pass Requirement & Exit Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Goal:{' '}
                    <strong style={{ color: '#0284c7' }}>
                      ≥ {activeDrill.lesson.passThreshold.minAccuracyPct}% Acc
                    </strong>{' '}
                    &amp;{' '}
                    <strong style={{ color: '#0284c7' }}>
                      ≥ {activeDrill.lesson.passThreshold.minWpm} WPM
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleExitDrill}
                    style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Exit Drill
                  </button>
                </div>
              </div>

              {/* Drill Result Card (shown upon test completion) */}
              {activeLessonResult && (
                <div
                  style={{
                    background: activeLessonResult.passed
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, var(--bg-card) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, var(--bg-card) 100%)',
                    border: `1.5px solid ${activeLessonResult.passed ? '#10b981' : '#ef4444'}`,
                    borderRadius: '1rem',
                    padding: '1.25rem 1.5rem',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: activeLessonResult.passed ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.65rem',
                        fontWeight: 900,
                      }}
                    >
                      {activeLessonResult.passed ? '✓' : '⚠️'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {activeLessonResult.passed ? 'Drill Passed! Excellent Technique!' : 'Drill Attempted — Keep Practicing!'}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Accuracy: <strong style={{ color: activeLessonResult.passed ? '#10b981' : '#ef4444' }}>{activeLessonResult.accuracyPct}%</strong> (Goal: ≥ {activeLessonResult.passThreshold.minAccuracyPct}%) • Speed:{' '}
                        <strong>{activeLessonResult.netWpm} WPM</strong> (Goal: ≥ {activeLessonResult.passThreshold.minWpm} WPM) • Errors: {activeLessonResult.errors}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleRetryCurrentDrill}
                      style={{
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        padding: '0.55rem 1.15rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ↺ Retry Drill
                    </button>
                    {activeLessonResult.passed && activeLessonResult.nextLesson && (
                      <button
                        type="button"
                        onClick={handleNextLesson}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '0.55rem 1.35rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
                        }}
                      >
                        Next Lesson Drill →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Typing Canvas */}
              <TypingCanvas
                durationSeconds={60}
                mode="words"
                customWords={activeDrill.words}
                onComplete={handleCompleteDrill}
                restartTrigger={restartCounter}
                onRestart={handleRetryCurrentDrill}
                onActiveCharChange={setActiveTargetChar}
                drillBadge={{
                  stageTitle: activeDrill.stage.title,
                  lessonTitle: activeDrill.lesson.title,
                  targetKeys: activeDrill.lesson.targetKeys,
                  passGoal: `≥ ${activeDrill.lesson.passThreshold.minAccuracyPct}% Acc & ≥ ${activeDrill.lesson.passThreshold.minWpm} WPM`,
                }}
              />

              {/* Toggle Virtual Hands & Keyboard Guide */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyboardGuide((prev) => !prev)}
                  style={{
                    background: showKeyboardGuide ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                    border: showKeyboardGuide ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                    color: showKeyboardGuide ? '#0284c7' : 'var(--text-secondary)',
                    padding: '0.45rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>⌨️</span>
                  <span>{showKeyboardGuide ? 'Hide Virtual Hands & Mechanical Keyboard' : 'Show Virtual Hands & Mechanical Keyboard'}</span>
                  <span style={{ fontSize: '0.7rem' }}>{showKeyboardGuide ? '▲' : '▼'}</span>
                </button>

                {/* Real-time Hands & Keyboard Kinematics */}
                {showKeyboardGuide && (
                  <div style={{ width: '100%' }}>
                    <FingerGuide
                      activeChar={activeTargetChar}
                      isDrill={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CURRICULUM OVERVIEW & STAGES BROWSER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <CurriculumView
              progressMap={progressMap}
              onSelectDrill={handleSelectDrill}
              activeLessonId={activeDrill?.lesson.id}
            />
          </div>

          {/* STANDALONE MECHANICAL KEYBOARD & REALISTIC HANDS WORKSTATION */}
          {!activeDrill && (
            <section
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Interactive Mechanical Keyboard & Hands Station
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    Practice resting on the home row (ASDF JKL;) and click any key to watch the designated finger reach and strike with real anatomical kinematics.
                  </p>
                </div>
              </div>

              <FingerGuide activeChar={activeTargetChar} />
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
