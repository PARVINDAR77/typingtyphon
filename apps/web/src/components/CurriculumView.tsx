'use client';

import React, { useState } from 'react';
import {
  ALL_CURRICULUM_STAGES,
  CurriculumStage,
  CurriculumLesson,
  FingerAssignment,
  isLessonUnlocked,
  getMissingPrerequisites,
  findLessonById,
} from '@typingtyphon/contracts';
import {
  LessonProgress,
  getAggregateKeyAnalytics,
  getKeyPerformanceBreakdown,
} from '../lib/storage';
import { generatePracticeRecommendation } from '../lib/recommendations';

interface CurriculumViewProps {
  progressMap: Record<string, LessonProgress>;
  onSelectDrill: (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => void;
  activeLessonId?: string | null;
}

const FINGER_DISPLAY_NAMES: Record<
  FingerAssignment,
  { label: string; hand: string; finger: string; color: string; handEmoji: string; kinematics: string }
> = {
  'left-pinky': { label: 'Left Pinky', hand: 'Left Hand', finger: 'Pinky', color: '#EC4899', handEmoji: '👈', kinematics: 'Home row anchor on A' },
  'left-ring': { label: 'Left Ring', hand: 'Left Hand', finger: 'Ring', color: '#A855F7', handEmoji: '👈', kinematics: 'Home row anchor on S' },
  'left-middle': { label: 'Left Middle', hand: 'Left Hand', finger: 'Middle', color: '#3B82F6', handEmoji: '👈', kinematics: 'Home row anchor on D' },
  'left-index': { label: 'Left Index', hand: 'Left Hand', finger: 'Index', color: '#06B6D4', handEmoji: '👈', kinematics: 'Tactile anchor on F (bump)' },
  thumb: { label: 'Thumbs (Space)', hand: 'Both Hands', finger: 'Thumb', color: '#10B981', handEmoji: '👍', kinematics: 'Rests on spacebar' },
  'right-index': { label: 'Right Index', hand: 'Right Hand', finger: 'Index', color: '#14B8A6', handEmoji: '👉', kinematics: 'Tactile anchor on J (bump)' },
  'right-middle': { label: 'Right Middle', hand: 'Right Hand', finger: 'Middle', color: '#6366F1', handEmoji: '👉', kinematics: 'Home row anchor on K' },
  'right-ring': { label: 'Right Ring', hand: 'Right Hand', finger: 'Ring', color: '#8B5CF6', handEmoji: '👉', kinematics: 'Home row anchor on L' },
  'right-pinky': { label: 'Right Pinky', hand: 'Right Hand', finger: 'Pinky', color: '#F43F5E', handEmoji: '👉', kinematics: 'Home row anchor on ;' },
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  progressMap,
  onSelectDrill,
  activeLessonId,
}) => {
  const [viewMode, setViewMode] = useState<'stages' | 'analytics'>('stages');
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(1);
  const [lockedAlertLessonId, setLockedAlertLessonId] = useState<string | null>(null);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

  const currentStage =
    ALL_CURRICULUM_STAGES.find((s) => s.stageNumber === selectedStageNumber) ||
    ALL_CURRICULUM_STAGES[0];

  const firstUnpassedLessonId = currentStage.lessons.find((l) => !progressMap[l.id]?.passed)?.id;

  const totalLessons = ALL_CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const passedLessonsCount = Object.values(progressMap).filter((p) => p.passed).length;

  const aggregateAnalytics = getAggregateKeyAnalytics();
  const breakdown = getKeyPerformanceBreakdown(aggregateAnalytics);
  const recommendation = generatePracticeRecommendation(
    aggregateAnalytics,
    progressMap,
    ALL_CURRICULUM_STAGES
  );

  const handleLaunchRecommendation = () => {
    if (!recommendation.suggestedLessonId) return;
    for (const stage of ALL_CURRICULUM_STAGES) {
      const lesson = stage.lessons.find((l) => l.id === recommendation.suggestedLessonId);
      if (lesson) {
        const words =
          recommendation.suggestedDrillType === 'remedial'
            ? lesson.remedialDrill
            : recommendation.suggestedDrillType === 'word'
            ? lesson.wordDrill
            : lesson.introDrill;
        onSelectDrill(stage, lesson, recommendation.suggestedDrillType || 'intro', words);
        break;
      }
    }
  };

  return (
    <section
      id="curriculum-view"
      style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Academy Header Banner */}
      <div
        style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.85rem',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#0284c7',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              Touch Typing Academy
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Stages 1–6 (Free &amp; Guest Accessible)
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Systematic Alphabet Mastery
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '0.25rem', maxWidth: '580px', lineHeight: 1.45 }}>
            Touch typing is neuromuscular motor memory. Master finger reaches systematically from home row anchors through top row, bottom row, numbers, and bilateral shift coordination.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.65rem 1.15rem',
            textAlign: 'center',
            minWidth: '130px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Progress
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', margin: '0.1rem 0' }}>
            {passedLessonsCount} / {totalLessons}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Lessons Passed
          </div>
        </div>
      </div>

      {/* Academy Navigation Mode Switcher: Stages vs Analytics */}
      <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface-subtle)', padding: '0.2rem', borderRadius: '9999px', border: '1px solid var(--border-subtle)', alignSelf: 'flex-start' }}>
        <button
          id="btn-tab-curriculum-stages"
          onClick={() => setViewMode('stages')}
          style={{
            background: viewMode === 'stages' ? 'var(--brand-primary)' : 'transparent',
            border: viewMode === 'stages' ? '1px solid var(--brand-cyan)' : '1px solid transparent',
            color: viewMode === 'stages' ? '#ffffff' : 'var(--text-secondary)',
            padding: '0.28rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease',
          }}
        >
          <span>📚</span>
          Stages 1–6 Lessons ({totalLessons})
        </button>

        <button
          id="btn-tab-curriculum-analytics"
          onClick={() => setViewMode('analytics')}
          style={{
            background: viewMode === 'analytics' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: viewMode === 'analytics' ? '1px solid #38BDF8' : '1px solid transparent',
            color: viewMode === 'analytics' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            padding: '0.28rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>📊</span>
          Personalized Key Analytics
          {breakdown.weakKeys.length > 0 && (
            <span style={{ background: '#F59E0B', color: '#0F172A', padding: '0.1rem 0.35rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 800 }}>
              {breakdown.weakKeys.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW MODE 1: CURRICULUM STAGES & LESSONS */}
      {viewMode === 'stages' && (
        <>
          {/* Stage Selector Grid (All 6 Stages visible with zero horizontal clipping) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
              gap: '0.65rem',
              width: '100%',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {ALL_CURRICULUM_STAGES.map((stage) => {
              const isSelected = stage.stageNumber === selectedStageNumber;
              const stagePassed = stage.lessons.filter((l) => progressMap[l.id]?.passed).length;
              const isAllPassed = stagePassed === stage.lessons.length && stage.lessons.length > 0;

              const shortTitles: Record<number, string> = {
                1: 'Home Row Anchors',
                2: 'Lateral Reaches',
                3: 'Top Row Reaches',
                4: 'Bottom Row Reaches',
                5: 'Number Row & Symbols',
                6: 'Shift & Punctuation',
              };
              const subtitle = shortTitles[stage.stageNumber] || stage.title;

              return (
                <button
                  type="button"
                  key={stage.slug}
                  id={`btn-stage-tab-${stage.stageNumber}`}
                  onClick={() => {
                    setSelectedStageNumber(stage.stageNumber);
                  }}
                  style={{
                    background: isSelected
                      ? 'rgba(14, 165, 233, 0.12)'
                      : 'var(--bg-card)',
                    border: isSelected ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.35rem',
                    textAlign: 'left',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    transform: isSelected ? 'translateY(-1px)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Stage {stage.stageNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: isAllPassed
                          ? 'rgba(16, 185, 129, 0.2)'
                          : isSelected
                          ? 'var(--brand-primary)'
                          : 'var(--bg-surface-subtle)',
                        color: isAllPassed
                          ? '#10B981'
                          : isSelected
                          ? '#ffffff'
                          : 'var(--text-muted)',
                        border: isAllPassed ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                      }}
                    >
                      {isAllPassed ? `✓ ${stagePassed}/${stage.lessons.length}` : `${stagePassed}/${stage.lessons.length}`}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.2,
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    {subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Description & Target Keys with Prev/Next Stepper */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                Stage {currentStage.stageNumber}: {currentStage.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, maxWidth: '620px' }}>
                {currentStage.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Keys:</span>
                {currentStage.targetKeys.slice(0, 10).map((k) => (
                  <kbd
                    key={k}
                    style={{
                      padding: '0.2rem 0.45rem',
                      borderRadius: '5px',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--brand-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {k.toUpperCase()}
                  </kbd>
                ))}
              </div>

              {/* Prev / Next Stage Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  id="btn-prev-stage"
                  onClick={() => setSelectedStageNumber(Math.max(1, selectedStageNumber - 1))}
                  disabled={selectedStageNumber <= 1}
                  style={{
                    background: selectedStageNumber <= 1 ? 'transparent' : 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.32rem 0.65rem',
                    color: selectedStageNumber <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: selectedStageNumber <= 1 ? 'not-allowed' : 'pointer',
                    opacity: selectedStageNumber <= 1 ? 0.35 : 1,
                  }}
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  id="btn-next-stage"
                  onClick={() => setSelectedStageNumber(Math.min(6, selectedStageNumber + 1))}
                  disabled={selectedStageNumber >= 6}
                  style={{
                    background: selectedStageNumber >= 6 ? 'transparent' : 'rgba(56, 189, 248, 0.15)',
                    border: selectedStageNumber >= 6 ? '1px solid var(--border-subtle)' : '1px solid #0284c7',
                    borderRadius: '6px',
                    padding: '0.32rem 0.65rem',
                    color: selectedStageNumber >= 6 ? 'var(--text-muted)' : '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: selectedStageNumber >= 6 ? 'not-allowed' : 'pointer',
                    opacity: selectedStageNumber >= 6 ? 0.35 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Stage Lessons List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentStage.lessons.map((lesson, idx) => {
              const progress = progressMap[lesson.id];
              const isPassed = !!progress?.passed;
              const isActive = activeLessonId === lesson.id;
              const isUnlocked = isLessonUnlocked(lesson, progressMap);
              const isFirstUnpassed = lesson.id === firstUnpassedLessonId;
              const isUpNext = !isPassed && (isFirstUnpassed || isUnlocked);
              const isPreviewOpen = previewLessonId === lesson.id;
              const missingPrereqIds = getMissingPrerequisites(lesson, progressMap);
              const firstMissing = missingPrereqIds[0] ? findLessonById(missingPrereqIds[0]) : null;

              // Accuracy & Speed progress percentages toward goal
              const accGoal = lesson.passThreshold.minAccuracyPct;
              const wpmGoal = lesson.passThreshold.minWpm;
              const accPct = progress ? Math.min(100, Math.round((progress.bestAccuracyPct / accGoal) * 100)) : 0;
              const wpmPct = progress ? Math.min(100, Math.round((progress.bestNetWpm / wpmGoal) * 100)) : 0;

              return (
                <div
                  key={lesson.id}
                  id={`card-lesson-${lesson.id}`}
                  style={{
                    background: isPassed
                      ? 'var(--bg-card)'
                      : isUpNext
                      ? 'var(--bg-card)'
                      : isActive
                      ? 'rgba(2, 132, 199, 0.08)'
                      : !isUnlocked
                      ? 'var(--bg-surface-subtle)'
                      : 'var(--bg-surface)',
                    border: isPassed
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : isUpNext
                      ? '1.5px solid var(--brand-primary)'
                      : isActive
                      ? '1.5px solid var(--brand-primary)'
                      : !isUnlocked
                      ? '1px dashed rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-subtle)',
                    borderLeft: isPassed
                      ? '4px solid #10B981'
                      : isUpNext
                      ? '4px solid var(--brand-primary)'
                      : !isUnlocked
                      ? '4px solid var(--text-muted)'
                      : '4px solid var(--brand-primary)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    boxShadow: isUpNext
                      ? 'var(--shadow-md)'
                      : isPassed
                      ? 'var(--shadow-card)'
                      : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Lesson Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Lesson {currentStage.stageNumber}.{idx + 1}
                        </span>

                        {isPassed ? (
                          <span
                            id={`badge-passed-${lesson.id}`}
                            style={{
                              background: 'rgba(16, 185, 129, 0.18)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)',
                            }}
                          >
                            <span>🏆</span>
                            <span>Mastered ({progress.bestAccuracyPct}% acc • {progress.bestNetWpm} WPM)</span>
                          </span>
                        ) : isUpNext ? (
                          <span
                            id={`badge-upnext-${lesson.id}`}
                            style={{
                              background: 'rgba(56, 189, 248, 0.18)',
                              color: '#38BDF8',
                              border: '1px solid rgba(56, 189, 248, 0.45)',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)',
                            }}
                          >
                            <span>🎯</span>
                            <span>Up Next • Recommended Drill</span>
                          </span>
                        ) : progress ? (
                          <span
                            id={`badge-attempted-${lesson.id}`}
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#F59E0B',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            ⚡ In Progress ({progress.bestAccuracyPct}% acc — Need ≥ {accGoal}%)
                          </span>
                        ) : !isUnlocked ? (
                          <span
                            id={`badge-locked-${lesson.id}`}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            🔒 Locked
                          </span>
                        ) : (
                          <span
                            id={`badge-notstarted-${lesson.id}`}
                            style={{
                              background: 'rgba(148, 163, 184, 0.12)',
                              color: '#94A3B8',
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Ready to Start
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                        {lesson.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
                        {lesson.description}
                      </p>
                      {lesson.learningObjective && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#38BDF8',
                            marginTop: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: 500,
                          }}
                        >
                          <span>🎯</span>
                          <span>Objective: {lesson.learningObjective}</span>
                        </div>
                      )}
                    </div>

                    {/* Performance Metrics & Pass Goals Dashboard */}
                    <div
                      style={{
                        background: 'var(--bg-surface-subtle)',
                        border: isPassed ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem 1rem',
                        minWidth: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                          {isPassed ? 'Performance Rating' : 'Pass Criteria'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: isPassed ? '#10B981' : '#38BDF8', fontWeight: 700 }}>
                          {isPassed ? '✓ Qualified' : `Goal: ≥${accGoal}% & ≥${wpmGoal}WPM`}
                        </span>
                      </div>

                      {/* Accuracy Metric Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Accuracy</span>
                          <strong style={{ color: isPassed ? '#10B981' : progress ? '#F59E0B' : 'var(--text-primary)' }}>
                            {progress ? `${progress.bestAccuracyPct}%` : '—'} / {accGoal}%
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progress ? Math.min(100, (progress.bestAccuracyPct / accGoal) * 100) : 0}%`,
                              height: '100%',
                              background: isPassed
                                ? '#10B981'
                                : progress?.bestAccuracyPct && progress.bestAccuracyPct >= accGoal
                                ? '#10B981'
                                : '#F59E0B',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Speed Metric Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Speed</span>
                          <strong style={{ color: isPassed ? '#10B981' : progress ? '#38BDF8' : 'var(--text-primary)' }}>
                            {progress ? `${progress.bestNetWpm} WPM` : '—'} / {wpmGoal} WPM
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${progress ? Math.min(100, (progress.bestNetWpm / wpmGoal) * 100) : 0}%`,
                              height: '100%',
                              background: isPassed ? '#10B981' : '#38BDF8',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Target Keys & Mechanical Keycap Anatomy Station */}
                  <div
                    style={{
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '0.85rem',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.9rem' }}>⌨️</span>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          Target Keys &amp; Designated Finger Kinematics
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Feel tactile bumps on F &amp; J • Rest on home row
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                      {Object.entries(lesson.targetFingers).map(([char, finger]) => {
                        const fingerInfo = FINGER_DISPLAY_NAMES[finger] || {
                          label: finger,
                          hand: 'Hand',
                          finger: finger,
                          color: '#38BDF8',
                          handEmoji: '✋',
                          kinematics: 'Designated key reach',
                        };
                        const isBumpKey = char.toLowerCase() === 'f' || char.toLowerCase() === 'j';

                        return (
                          <div
                            key={char}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.85rem',
                              background: 'var(--bg-card)',
                              border: `1px solid ${fingerInfo.color}35`,
                              borderRadius: '0.75rem',
                              padding: '0.65rem 0.95rem',
                              boxShadow: 'var(--shadow-card)',
                            }}
                          >
                            {/* 3D Mechanical Keycap Simulation */}
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--bg-surface)',
                                border: '1.5px solid var(--border-medium)',
                                borderRadius: '8px',
                                boxShadow: `0 3px 0 var(--border-medium), var(--shadow-sm)`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                userSelect: 'none',
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '1.2rem',
                                  fontWeight: 800,
                                  color: fingerInfo.color,
                                  lineHeight: 1,
                                  textShadow: `0 0 10px ${fingerInfo.color}55`,
                                }}
                              >
                                {char.toUpperCase()}
                              </span>
                              {/* Raised Tactile Orientation Bump for F and J */}
                              {isBumpKey && (
                                <div
                                  title="Raised tactile orientation bump: feel this with your index finger"
                                  style={{
                                    width: '14px',
                                    height: '2.5px',
                                    background: fingerInfo.color,
                                    borderRadius: '2px',
                                    marginTop: '3px',
                                    boxShadow: `0 0 6px ${fingerInfo.color}`,
                                  }}
                                />
                              )}
                            </div>

                            {/* Finger & Hand Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.78rem' }}>{fingerInfo.handEmoji}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {fingerInfo.hand}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  color: fingerInfo.color,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: fingerInfo.color }} />
                                {fingerInfo.finger}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                                {fingerInfo.kinematics}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Exercise Preview Drawer (Show & Learn) */}
                  {isPreviewOpen && (
                    <div
                      id={`drawer-preview-${lesson.id}`}
                      style={{
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.85rem',
                        padding: '1.1rem 1.35rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        animation: 'fadeIn 0.2s ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem' }}>👁️</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Exercise Preview &amp; Pattern Breakdown
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Candidate Study Bay • Practice rhythm and finger isolation
                        </span>
                      </div>

                      {/* Intro Drill Sequence */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            1. Intro Drill ({lesson.introDrill.length} exercises):
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectDrill(currentStage, lesson, 'intro', lesson.introDrill)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--brand-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span>Start Intro</span>
                            <span>→</span>
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {lesson.introDrill.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--brand-primary)',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Word Drill Sequence */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            2. Word Drill ({lesson.wordDrill.length} vocabulary words):
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectDrill(currentStage, lesson, 'word', lesson.wordDrill)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--brand-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span>Start Word Drill</span>
                            <span>→</span>
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {lesson.wordDrill.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                              }}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pedagogical Guidance Tip */}
                      <div
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '0.5rem',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.75rem',
                          color: '#BAE6FD',
                          lineHeight: 1.45,
                        }}
                      >
                        💡 <strong>How to Master This:</strong> Look straight at the screen. Position both index fingers on the physical tactile bumps of <strong>F</strong> and <strong>J</strong>. Press keys rhythmically without glancing at your hands to build permanent neuromuscular motor memory.
                      </div>
                    </div>
                  )}

                  {/* Locked Lesson Guidance Banner */}
                  {!isUnlocked && (
                    <div
                      id={`locked-guidance-${lesson.id}`}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '0.75rem',
                        padding: '0.85rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🔒</span>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F87171' }}>
                            Prerequisite Lesson Required
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {firstMissing ? (
                              <>
                                Pass <strong>{firstMissing.lesson.title}</strong> (Stage {firstMissing.stage.stageNumber}: {firstMissing.stage.title}) with ≥ {firstMissing.lesson.passThreshold.minAccuracyPct}% accuracy to unlock.
                              </>
                            ) : (
                              'Complete preceding lessons to unlock this exercise.'
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {firstMissing && (
                          <button
                            id={`btn-goto-prereq-${lesson.id}`}
                            onClick={() => {
                              setSelectedStageNumber(firstMissing.stage.stageNumber);
                              setTimeout(() => {
                                const el = document.getElementById(`card-lesson-${firstMissing.lesson.id}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 60);
                            }}
                            style={{
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '0.375rem',
                              padding: '0.45rem 0.85rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <span>Go to Prerequisite</span>
                            <span>→</span>
                          </button>
                        )}
                        <button
                          id={`btn-override-unlock-${lesson.id}`}
                          onClick={() => onSelectDrill(currentStage, lesson, 'intro', lesson.introDrill)}
                          style={{
                            background: 'transparent',
                            border: '1px dashed #64748B',
                            color: '#94A3B8',
                            borderRadius: '0.375rem',
                            padding: '0.4rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Practice this lesson without meeting prerequisites"
                        >
                          Preview Drill Anyway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Locked Attempt Guidance Warning */}
                  {lockedAlertLessonId === lesson.id && (
                    <div
                      id={`locked-alert-${lesson.id}`}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #EF4444',
                        borderRadius: '0.5rem',
                        padding: '0.65rem 1rem',
                        color: '#FECACA',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⚠️</span>
                        <span>
                          This lesson is locked! Complete {firstMissing ? `"${firstMissing.lesson.title}" in Stage ${firstMissing.stage.stageNumber}` : 'earlier prerequisites'} first to build proper finger technique.
                        </span>
                      </div>
                      <button
                        onClick={() => setLockedAlertLessonId(null)}
                        style={{ background: 'transparent', border: 'none', color: '#FECACA', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Drill Action Buttons Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginTop: '0.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <button
                        id={`btn-drill-intro-${lesson.id}`}
                        onClick={() => {
                          onSelectDrill(currentStage, lesson, 'intro', lesson.introDrill);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.35)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>Start Intro Drill ({lesson.introDrill.length})</span>
                      </button>

                      <button
                        id={`btn-drill-word-${lesson.id}`}
                        onClick={() => {
                          onSelectDrill(currentStage, lesson, 'word', lesson.wordDrill);
                        }}
                        style={{
                          background: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          padding: '0.6rem 1.15rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>🔤</span>
                        <span>Word Drill ({lesson.wordDrill.length} words)</span>
                      </button>

                      {lesson.remedialDrill.length > 0 && (
                        <button
                          id={`btn-drill-remedial-${lesson.id}`}
                          onClick={() => {
                            onSelectDrill(currentStage, lesson, 'remedial', lesson.remedialDrill);
                          }}
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            color: '#F59E0B',
                            padding: '0.6rem 1.15rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>🎯</span>
                          <span>Remedial Accuracy Drill</span>
                        </button>
                      )}
                    </div>

                    {/* Interactive "Show & Learn" Preview Toggle */}
                    <button
                      type="button"
                      id={`btn-toggle-preview-${lesson.id}`}
                      onClick={() => setPreviewLessonId(isPreviewOpen ? null : lesson.id)}
                      style={{
                        background: isPreviewOpen ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-subtle)',
                        border: isPreviewOpen ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
                        color: isPreviewOpen ? '#0284c7' : 'var(--text-secondary)',
                        padding: '0.55rem 0.95rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{isPreviewOpen ? 'Hide Drill Words ▴' : '👁️ Show Drill Words ▾'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW MODE 2: PERSONALIZED KEY ANALYTICS */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personalized Practice Recommendation Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1.5px solid #38BDF8',
              borderRadius: '1.25rem',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  color: '#38BDF8',
                  background: 'rgba(56, 189, 248, 0.2)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                }}
              >
                Recommended Next Practice
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Deterministic Rule Engine (Zero AI / Reproducible)
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              {recommendation.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '750px' }}>
              {recommendation.reason}
            </p>

            {recommendation.suggestedLessonId && (
              <button
                id="btn-launch-recommendation"
                onClick={handleLaunchRecommendation}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.35rem',
                  background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                }}
              >
                <span>🎯</span>
                Launch Recommended Drill Now →
              </button>
            )}
          </div>

          {/* Key Metric Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weak Keys (Needs Focus)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: breakdown.weakKeys.length > 0 ? '#F59E0B' : '#10B981', margin: '0.25rem 0' }}>
                {breakdown.weakKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accuracy &lt; 90% with ≥ 2 errors
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slow Hesitation Keys</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', margin: '0.25rem 0' }}>
                {breakdown.slowKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accurate but latency &gt; 1.6× average
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strong Touch Keys</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: '0.25rem 0' }}>
                {breakdown.strongKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ≥ 96% accuracy &amp; clean cadence
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Keystroke Latency</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '0.25rem 0' }}>
                {breakdown.overallAverageLatencyMs} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ms</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Mean inter-keystroke interval
              </div>
            </div>
          </div>

          {/* Full Per-Key Telemetry Data Table */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowX: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                All Tracked Keyboard Characters ({breakdown.totalTrackedKeys})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sample gate: &lt; 5 attempts marked as insufficient data
              </span>
            </div>

            {Object.keys(aggregateAnalytics).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No keystroke data recorded yet. Complete your first practice test or Academy lesson to view per-key analytics!
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Key</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Attempts</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Accuracy</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Errors</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Corrected</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Avg Latency</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(aggregateAnalytics)
                    .sort((a, b) => b.totalAttempts - a.totalAttempts)
                    .map((item) => (
                      <tr key={item.key} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <kbd
                            style={{
                              background: 'var(--bg-surface-subtle)',
                              border: '1px solid var(--border-medium)',
                              color: 'var(--brand-primary)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {item.key === ' ' ? 'SPACE' : item.key.toUpperCase()}
                          </kbd>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.totalAttempts}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', color: item.accuracyPct >= 95 ? '#10B981' : item.accuracyPct >= 88 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                          {item.accuracyPct}%
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.errorCount}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.correctedCount}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.averageLatencyMs} ms</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background:
                                item.sampleConfidence === 'high'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.sampleConfidence === 'moderate'
                                  ? 'rgba(56, 189, 248, 0.15)'
                                  : item.sampleConfidence === 'low'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(148, 163, 184, 0.12)',
                              color:
                                item.sampleConfidence === 'high'
                                  ? '#10B981'
                                  : item.sampleConfidence === 'moderate'
                                  ? '#38BDF8'
                                  : item.sampleConfidence === 'low'
                                  ? '#F59E0B'
                                  : '#94A3B8',
                              fontWeight: 600,
                            }}
                          >
                            {item.sampleConfidence.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
