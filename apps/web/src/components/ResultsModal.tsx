'use client';

import React from 'react';
import { EngineResult, ALL_CURRICULUM_STAGES } from '@typingtyphon/contracts';
import { generatePracticeRecommendation } from '../lib/recommendations';
import { getAggregateKeyAnalytics, getGuestCurriculumProgress, getKeyPerformanceBreakdown } from '../lib/storage';

interface ResultsModalProps {
  result: EngineResult;
  onRestart: () => void;
  guestSessionCount: number;
  onOpenAuth?: () => void;
  lessonResult?: {
    lessonTitle: string;
    passed: boolean;
    passThreshold: { minAccuracyPct: number; minWpm: number };
    needsRemedial: boolean;
  } | null;
  onStartRecommendation?: (lessonId: string, drillType: 'intro' | 'word' | 'remedial') => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  result,
  onRestart,
  guestSessionCount,
  onOpenAuth,
  lessonResult,
  onStartRecommendation,
}) => {
  const correctedMistakes = Math.max(0, result.errorCount - result.uncorrectedErrors);

  // Compute key breakdown and personalized recommendation
  const aggregateAnalytics = getAggregateKeyAnalytics();
  const curriculumProgress = getGuestCurriculumProgress();
  const breakdown = getKeyPerformanceBreakdown(aggregateAnalytics);
  const recommendation = generatePracticeRecommendation(
    aggregateAnalytics,
    curriculumProgress,
    ALL_CURRICULUM_STAGES
  );

  const handleLaunchRec = () => {
    if (recommendation.suggestedLessonId && onStartRecommendation) {
      onStartRecommendation(
        recommendation.suggestedLessonId,
        recommendation.suggestedDrillType || 'intro'
      );
    } else {
      onRestart();
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        id="results-modal"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.25rem',
          padding: '2rem 2.25rem',
          maxWidth: '620px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'fadeIn 0.2s ease',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Curriculum Lesson Feedback Banner */}
        {lessonResult && (
          <div
            style={{
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              background: lessonResult.passed
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(245, 158, 11, 0.15)',
              border: lessonResult.passed
                ? '1px solid #10B981'
                : '1px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>
              {lessonResult.passed ? '🎉' : '🎯'}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: lessonResult.passed ? '#10B981' : '#F59E0B',
                }}
              >
                {lessonResult.passed ? 'Lesson Drill Passed!' : 'Accuracy Gate Not Met'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {lessonResult.passed
                  ? `Mastery achieved for ${lessonResult.lessonTitle}. Goal was ≥ ${lessonResult.passThreshold.minAccuracyPct}% Acc and ≥ ${lessonResult.passThreshold.minWpm} WPM.`
                  : `Touch typing requires ≥ ${lessonResult.passThreshold.minAccuracyPct}% accuracy before advancing. Practice the remedial drill to build muscle memory.`}
              </div>
            </div>
          </div>
        )}

        {/* Primary Hero Metric: Net WPM */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Test Completed
          </div>
          <div style={{ fontSize: '4.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--char-correct)', lineHeight: 1 }}>
            {result.netWpm}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            NET WORDS PER MINUTE
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Usable productive speed with error penalties applied
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            background: 'var(--bg-primary)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: result.accuracyPct >= 95 ? 'var(--success)' : 'var(--warning)' }}>
              {result.accuracyPct}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Speed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {result.grossWpm} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WPM</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Mistakes</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: result.errorCount > 0 ? 'var(--char-incorrect)' : 'var(--text-secondary)' }}>
              {result.errorCount}
            </div>
          </div>
        </div>

        {/* Error Breakdown: Corrected vs Uncorrected */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.65rem 1rem',
            borderRadius: '0.6rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            Uncorrected Errors: <strong style={{ color: result.uncorrectedErrors > 0 ? '#EF4444' : '#10B981' }}>{result.uncorrectedErrors}</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>(-1 word/error penalty)</span>
          </span>
          <span>
            Corrected with Backspace: <strong style={{ color: 'var(--brand-primary)' }}>{correctedMistakes}</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>(zero Net WPM penalty)</span>
          </span>
        </div>

        {/* Secondary Telemetry Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '0 0.5rem' }}>
          <span>Duration: <strong style={{ color: 'var(--text-primary)' }}>{result.durationSeconds}s</strong></span>
          <span>Rhythm Consistency: <strong style={{ color: 'var(--text-primary)' }}>{result.consistencyPct}%</strong></span>
          <span>Words Finished: <strong style={{ color: 'var(--text-primary)' }}>{result.completedWordsCount}</strong></span>
        </div>

        {/* Key Performance Telemetry Highlights */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.9rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Key Performance Telemetry
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {breakdown.weakKeys.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#F59E0B' }}>Needs Practice:</span>
                {breakdown.weakKeys.slice(0, 3).map((k) => (
                  <span
                    key={k.key}
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#F59E0B',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {k.key.toUpperCase()} ({k.accuracyPct}%)
                  </span>
                ))}
              </div>
            ) : breakdown.strongKeys.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Strong Keys:</span>
                {breakdown.strongKeys.slice(0, 4).map((k) => (
                  <span
                    key={k.key}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {k.key.toUpperCase()} ({k.accuracyPct}%)
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sample size building (minimum 5 attempts per key required to verify strengths and weaknesses).
              </span>
            )}
          </div>
        </div>

        {/* Personalized Practice Recommendation Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '0.75rem',
            padding: '1rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'var(--brand-primary)',
              }}
            >
              Recommended Next Activity
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deterministic Rule Engine
            </span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {recommendation.title}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {recommendation.reason}
          </div>

          {recommendation.suggestedLessonId && (
            <button
              onClick={handleLaunchRec}
              style={{
                alignSelf: 'flex-start',
                marginTop: '0.25rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                padding: '0.4rem 0.85rem',
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              Start Recommended Practice →
            </button>
          )}
        </div>

        {/* Contextual Respectful Account Invitation */}
        {guestSessionCount >= 3 && (
          <div
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.825rem' }}>
              <span>☁️</span>
              Don&apos;t lose your progress!
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              You have completed {guestSessionCount} sessions as a guest. Create a free account to sync your stats and progress across devices.
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sync to Free Account →
              </button>
            )}
          </div>
        )}

        {/* Primary Action Button */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onRestart}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '0.85rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Restart Test (Tab / Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
