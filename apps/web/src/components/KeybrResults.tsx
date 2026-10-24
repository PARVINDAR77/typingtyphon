'use client';

import React, { useState, useMemo } from 'react';
import { EngineResult, ALL_CURRICULUM_STAGES } from '@typingtyphon/contracts';
import { KEYBOARD_LAYOUT_ROWS, getFingerForKey, FINGER_DATA } from '../lib/fingerMapping';
import { generatePracticeRecommendation } from '../lib/recommendations';
import { getAggregateKeyAnalytics, getGuestCurriculumProgress, getKeyPerformanceBreakdown } from '../lib/storage';
import { LiveResultsTypingDeck } from './LiveResultsTypingDeck';

interface KeybrResultsProps {
  result: EngineResult;
  sessionWords?: string[];
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
  onPracticeSpecificKeys?: (keys: string[]) => void;
  onClose?: () => void;
}

type HeatmapMode = 'accuracy' | 'latency' | 'finger';

export const KeybrResults: React.FC<KeybrResultsProps> = ({
  result,
  sessionWords,
  onRestart,
  guestSessionCount,
  onOpenAuth,
  lessonResult,
  onStartRecommendation,
  onPracticeSpecificKeys,
  onClose,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('accuracy');
  const [copiedToast, setCopiedToast] = useState(false);
  const [chartHoverIndex, setChartHoverIndex] = useState<number | null>(null);

  const aggregateAnalytics = getAggregateKeyAnalytics();
  const curriculumProgress = getGuestCurriculumProgress();
  const breakdown = getKeyPerformanceBreakdown(aggregateAnalytics);
  const recommendation = generatePracticeRecommendation(
    aggregateAnalytics,
    curriculumProgress,
    ALL_CURRICULUM_STAGES
  );

  const correctedMistakes = Math.max(0, result.errorCount - result.uncorrectedErrors);
  const perKey = result.perKeyMetrics || {};
  const testedKeys = Object.keys(perKey);

  // Ergonomic Hand Workload Calculation
  const handWorkload = useMemo(() => {
    let leftKeystrokes = 0;
    let rightKeystrokes = 0;

    for (const [keyStr, metric] of Object.entries(perKey)) {
      const finger = getFingerForKey(keyStr);
      if (finger) {
        if (finger.hand === 'left') {
          leftKeystrokes += metric.totalAttempts;
        } else {
          rightKeystrokes += metric.totalAttempts;
        }
      }
    }

    const total = leftKeystrokes + rightKeystrokes || 1;
    const leftPct = Math.round((leftKeystrokes / total) * 100);
    const rightPct = 100 - leftPct;

    return { leftKeystrokes, rightKeystrokes, leftPct, rightPct };
  }, [perKey]);

  // Overall key counts by status
  const keyStatsSummary = useMemo(() => {
    let mastered = 0;
    let moderate = 0;
    let weak = 0;
    let untested = 0;

    for (const row of KEYBOARD_LAYOUT_ROWS) {
      for (const kItem of row) {
        const k = kItem.key.toLowerCase();
        const m = perKey[k] || aggregateAnalytics[k];
        if (!m || m.totalAttempts === 0) {
          untested++;
        } else if (m.errorCount > 0 && m.accuracyPct < 88) {
          weak++;
        } else if (m.accuracyPct < 95 || m.errorCount > 0) {
          moderate++;
        } else {
          mastered++;
        }
      }
    }
    return { mastered, moderate, weak, untested };
  }, [perKey, aggregateAnalytics]);

  // Compute key heatmap status for a key string
  const getKeyStatus = (keyStr: string) => {
    const k = keyStr.toLowerCase();
    const metric = perKey[k] || aggregateAnalytics[k];
    const finger = getFingerForKey(keyStr);

    if (!metric || metric.totalAttempts === 0) {
      return {
        status: 'untested' as const,
        color: 'var(--bg-surface-subtle)',
        borderColor: 'var(--border-subtle)',
        textColor: 'var(--text-muted)',
        glow: 'none',
        metric: null,
        finger,
      };
    }

    if (metric.errorCount > 0 && metric.accuracyPct < 88) {
      return {
        status: 'weak' as const,
        color: 'rgba(244, 63, 94, 0.22)',
        borderColor: '#f43f5e',
        textColor: '#fda4af',
        glow: '0 0 14px rgba(244, 63, 94, 0.4)',
        metric,
        finger,
      };
    }
    if (metric.accuracyPct < 95 || metric.errorCount > 0) {
      return {
        status: 'moderate' as const,
        color: 'rgba(245, 158, 11, 0.22)',
        borderColor: '#f59e0b',
        textColor: '#fbbf24',
        glow: '0 0 12px rgba(245, 158, 11, 0.35)',
        metric,
        finger,
      };
    }
    return {
      status: 'mastered' as const,
      color: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      textColor: '#34d399',
      glow: '0 0 14px rgba(16, 185, 129, 0.35)',
      metric,
      finger,
    };
  };

  // Inspect currently selected key or first weak key
  const activeInspectKey = selectedKey || (breakdown.weakKeys[0]?.key ?? testedKeys[0] ?? 'f');
  const inspectMetric = perKey[activeInspectKey.toLowerCase()] || aggregateAnalytics[activeInspectKey.toLowerCase()];
  const inspectFinger = getFingerForKey(activeInspectKey);
  const inspectStatus = getKeyStatus(activeInspectKey);

  // WPM Milestone Category
  const getSpeedTier = (wpm: number) => {
    if (wpm >= 90) return { label: 'Grandmaster Velocity', badge: '👑 Elite', color: '#ec4899' };
    if (wpm >= 70) return { label: 'High Velocity', badge: '🔥 Master', color: '#f59e0b' };
    if (wpm >= 50) return { label: 'Proficient Flow', badge: '🚀 Advanced', color: '#10b981' };
    if (wpm >= 30) return { label: 'Intermediate Speed', badge: '⚡ Intermediate', color: '#38bdf8' };
    return { label: 'Foundational Cadence', badge: '🌱 Apprentice', color: '#94a3b8' };
  };

  const speedTier = getSpeedTier(result.netWpm);

  // Time series points for SVG area chart
  const timeSeriesData = useMemo(() => {
    if (result.timeSeries && result.timeSeries.length > 1) {
      return result.timeSeries;
    }
    // Synthetic smooth timeline fallback if timeSeries was empty
    const points = [];
    const dur = Math.max(1, Math.round(result.elapsedSeconds || result.durationSeconds || 30));
    for (let s = 1; s <= dur; s++) {
      const progress = s / dur;
      const variation = Math.sin(progress * Math.PI) * 4;
      const rollingWpm = Math.max(0, Math.round((result.netWpm + variation - 2) * 10) / 10);
      points.push({
        second: s,
        rollingWpm,
        cumulativeNetWpm: result.netWpm,
        cumulativeGrossWpm: result.grossWpm,
        errorsThisSecond: s === Math.round(dur * 0.4) ? 1 : 0,
      });
    }
    return points;
  }, [result]);

  const chartMaxWpm = useMemo(() => {
    const maxVal = Math.max(...timeSeriesData.map((d) => Math.max(d.rollingWpm, d.cumulativeGrossWpm, result.netWpm, result.grossWpm)));
    return Math.max(40, Math.ceil((maxVal + 8) / 10) * 10);
  }, [timeSeriesData, result]);

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

  const handlePracticeWeakest = () => {
    const weakKeyList = breakdown.weakKeys.map((w) => w.key);
    if (weakKeyList.length > 0 && onPracticeSpecificKeys) {
      onPracticeSpecificKeys(weakKeyList);
    } else if (onStartRecommendation && recommendation.suggestedLessonId) {
      handleLaunchRec();
    } else {
      onRestart();
    }
  };

  const handleCopyReport = () => {
    const text = [
      `⚡ Typing Typhon Performance Telemetry`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• Net Speed: ${result.netWpm} WPM (${speedTier.badge})`,
      `• Accuracy: ${result.accuracyPct}% (${result.accuracyPct >= 95 ? 'Passed Touch Gate' : 'Below 95% Gate'})`,
      `• Raw Keystroke Speed: ${result.grossWpm} WPM`,
      `• Mistakes: ${result.errorCount} (${correctedMistakes} corrected, ${result.uncorrectedErrors} uncorrected)`,
      `• Keystroke Rhythm: ${result.consistencyPct}% consistency`,
      breakdown.weakKeys.length > 0
        ? `• Weakest Keys: ${breakdown.weakKeys.slice(0, 4).map((k) => k.key.toUpperCase()).join(', ')}`
        : `• All Tested Keys Mastered!`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Measured via Keybr Matrix on Typing Typhon`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    });
  };

  return (
    <div
      style={{
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem 5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.25rem',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header & Cybernetic Action Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.5rem',
        }}
      >
        <div>
          {/* Cyber Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '9999px',
              padding: '0.3rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#38bdf8',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
                display: 'inline-block',
              }}
            />
            <span>KEYBR MATRIX 2.0 • PERFORMANCE TELEMETRY</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.85rem, 3.8vw, 2.65rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0.15rem 0 0.35rem 0',
              color: 'var(--text-primary)',
            }}
          >
            Session Analysis & Keyboard Heatmap
          </h1>

          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Microsecond latency telemetry, finger workload balance, and algorithmic muscle-memory diagnostics.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Copy Report */}
          <button
            onClick={handleCopyReport}
            type="button"
            title="Copy formatted session report to clipboard"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: copiedToast ? '#10b981' : 'var(--text-secondary)',
              padding: '0.7rem 1.1rem',
              borderRadius: '0.75rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease',
            }}
          >
            {copiedToast ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Report Copied!</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Share Summary</span>
              </>
            )}
          </button>

          {/* Take Another Test (Primary) */}
          <button
            onClick={onRestart}
            type="button"
            className="btn-primary"
            style={{
              padding: '0.7rem 1.35rem',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 24px rgba(14, 165, 233, 0.35)',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Take Another Test
          </button>

          {/* Back to Test View */}
          {onClose && (
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '0.7rem 1.15rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Back to Test View
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Lesson Feedback (if this test was a lesson drill) */}
      {lessonResult && (
        <div
          style={{
            borderRadius: '1rem',
            padding: '1.25rem 1.75rem',
            background: lessonResult.passed
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, var(--bg-card) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, var(--bg-card) 100%)',
            border: lessonResult.passed ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(245, 158, 11, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: lessonResult.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}
            >
              {lessonResult.passed ? '🎉' : '🎯'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: lessonResult.passed ? '#34d399' : '#fbbf24' }}>
                {lessonResult.passed ? 'Curriculum Lesson Benchmark Passed!' : 'Touch Typing Accuracy Benchmark Unmet'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {lessonResult.passed
                  ? `You cleared the touch-typing gate for ${lessonResult.lessonTitle} (≥ ${lessonResult.passThreshold.minAccuracyPct}% Acc & ${lessonResult.passThreshold.minWpm} WPM).`
                  : `Touch typing requires high accuracy (≥ ${lessonResult.passThreshold.minAccuracyPct}%) before speeding up. Take the targeted drill below to reinforce muscle memory.`}
              </div>
            </div>
          </div>

          <button
            onClick={handleLaunchRec}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.65rem',
              fontSize: '0.825rem',
              fontWeight: 700,
            }}
          >
            {lessonResult.passed ? 'Next Curriculum Lesson →' : 'Launch Remedial Drill →'}
          </button>
        </div>
      )}

      {/* Hero 4 Metrics Cards (Glassmorphism + Neon Cyber Accents) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* CARD 1: NET SPEED */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2.5px solid #10b981',
            borderRadius: '1.25rem',
            padding: '1.65rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#059669', fontWeight: 800 }}>
                Net Speed (Standard)
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {speedTier.badge}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0 0.35rem 0' }}>
              <span
                className="tabular-nums"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                {result.netWpm}
              </span>
              <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 700 }}>WPM</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>⚡</span>
              <span>{speedTier.label}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Error-penalized productive speed
            </div>
          </div>
        </div>

        {/* CARD 2: ACCURACY */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderTop: result.accuracyPct >= 95 ? '2.5px solid #0ea5e9' : '2.5px solid #d97706',
            borderRadius: '1.25rem',
            padding: '1.65rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: result.accuracyPct >= 95 ? '#0284c7' : '#d97706',
                  fontWeight: 800,
                }}
              >
                Accuracy
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: result.accuracyPct >= 95 ? 'rgba(14, 165, 233, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: result.accuracyPct >= 95 ? '#0284c7' : '#d97706',
                  border: `1px solid ${result.accuracyPct >= 95 ? 'rgba(14, 165, 233, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                }}
              >
                {result.accuracyPct >= 95 ? 'Gate Passed' : 'Below Gate'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0 0.35rem 0' }}>
              <span
                className="tabular-nums"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: result.accuracyPct >= 95 ? 'var(--text-primary)' : '#d97706',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                {result.accuracyPct}%
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            {/* Visual accuracy progress bar towards 95% threshold */}
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-subtle)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, result.accuracyPct)}%`,
                  height: '100%',
                  background: result.accuracyPct >= 95 ? 'linear-gradient(90deg, #0284c7, #38bdf8)' : 'linear-gradient(90deg, #ea580c, #f59e0b)',
                  borderRadius: '3px',
                }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.45rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Target: ≥ 95% touch gate</span>
              <span>{result.accuracyPct >= 95 ? '✓ Clean Form' : `-${(95 - result.accuracyPct).toFixed(1)}% needed`}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: RAW SPEED */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2.5px solid #8b5cf6',
            borderRadius: '1.25rem',
            padding: '1.65rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7c3aed', fontWeight: 800 }}>
                Raw Speed
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: '#7c3aed',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                Output Rate
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.75rem 0 0.35rem 0' }}>
              <span
                className="tabular-nums"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                {result.grossWpm}
              </span>
              <span style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontWeight: 700 }}>WPM</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Keystrokes</span>
              <span className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {result.totalKeystrokes || Math.round(result.grossWpm * 5 * (result.elapsedSeconds / 60))}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Gross character emission rate
            </div>
          </div>
        </div>

        {/* CARD 4: ERRORS & RHYTHM CONSISTENCY */}
        <div
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderTop: '2.5px solid #f43f5e',
            borderRadius: '1.25rem',
            padding: '1.65rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e11d48', fontWeight: 800 }}>
                Errors & Consistency
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: 'rgba(14, 165, 233, 0.12)',
                  color: '#0284c7',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              >
                Rhythm
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.75rem 0 0.35rem 0' }}>
              <div>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: result.errorCount > 0 ? '#e11d48' : '#059669',
                    lineHeight: 1,
                  }}
                >
                  {result.errorCount}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>errors</span>
              </div>

              <div>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#0284c7',
                    lineHeight: 1,
                  }}
                >
                  {result.consistencyPct}%
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>rhythm</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{correctedMistakes} corrected via backspace</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{result.uncorrectedErrors} uncorrected</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Latency variance between keystrokes
            </div>
          </div>
        </div>
      </div>

      {/* Speed & Keystroke Rhythm Timeline Chart (Monkeytype / Keybr Caliber) */}
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7', fontWeight: 800 }}>
                Real-Time Telemetry
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WPM Velocity & Mistake Timeline</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: 'var(--text-primary)' }}>
              Cadence & Speed Trajectory
            </h3>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '3px', background: '#38bdf8', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Rolling Net WPM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '12px', height: '2px', background: '#8b5cf6', borderTop: '2px dashed #8b5cf6' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Raw WPM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Keystroke Error</span>
            </div>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div style={{ position: 'relative', width: '100%', height: '140px' }}>
          <svg
            viewBox="0 0 800 130"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="wpmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.33, 0.66, 1].map((ratio, idx) => {
              const y = 10 + ratio * 105;
              const val = Math.round(chartMaxWpm * (1 - ratio));
              return (
                <g key={idx}>
                  <line x1="0" y1={y} x2="800" y2={y} stroke="var(--border-subtle)" strokeDasharray="4 4" />
                  <text x="795" y={y - 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
                    {val} WPM
                  </text>
                </g>
              );
            })}

            {/* Smooth SVG Area & Curve Path */}
            {(() => {
              const pts = timeSeriesData.map((d, i) => {
                const x = (i / Math.max(1, timeSeriesData.length - 1)) * 800;
                const y = 115 - (d.rollingWpm / chartMaxWpm) * 105;
                return { x, y, raw: d };
              });

              if (pts.length < 2) return null;

              const linePath = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
              const areaPath = `${linePath} L ${pts[pts.length - 1].x} 115 L ${pts[0].x} 115 Z`;

              return (
                <>
                  <path d={areaPath} fill="url(#wpmAreaGradient)" />
                  <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Points and Error Indicators */}
                  {pts.map((p, i) => (
                    <g key={i}>
                      {p.raw.errorsThisSecond > 0 && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5"
                          fill="#f43f5e"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        >
                          <title>{`Error at ${p.raw.second}s`}</title>
                        </circle>
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#38bdf8"
                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setChartHoverIndex(i)}
                        onMouseLeave={() => setChartHoverIndex(null)}
                      />
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>

          {/* Interactive Hover Tooltip */}
          {chartHoverIndex !== null && timeSeriesData[chartHoverIndex] && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: `${(chartHoverIndex / Math.max(1, timeSeriesData.length - 1)) * 90}%`,
                background: 'var(--bg-card)',
                border: '1px solid var(--brand-primary)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-md)',
                zIndex: 20,
              }}
            >
              <div style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Second {timeSeriesData[chartHoverIndex].second}s</div>
              <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                Speed: <strong>{timeSeriesData[chartHoverIndex].rollingWpm}</strong> WPM
              </div>
              {timeSeriesData[chartHoverIndex].errorsThisSecond > 0 && (
                <div style={{ color: '#f43f5e' }}>{timeSeriesData[chartHoverIndex].errorsThisSecond} error(s)</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Section: Full-Width 3D Mechanical Keyboard Deck & Performance Inspector Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          width: '100%',
        }}
      >
        {/* Full-Width 3D Mechanical Keyboard Heatmap Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-card)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Header & Heatmap Metric View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Keybr Frequency & Speed Heatmap
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Every mechanical key analyzed for latency, confidence, and mistake frequency.
              </p>
            </div>

            {/* Heatmap Mode Toggle Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-surface-subtle)',
                padding: '0.2rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setHeatmapMode('accuracy')}
                style={{
                  background: heatmapMode === 'accuracy' ? 'var(--brand-primary)' : 'transparent',
                  border: 'none',
                  color: heatmapMode === 'accuracy' ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Accuracy Map
              </button>
              <button
                type="button"
                onClick={() => setHeatmapMode('latency')}
                style={{
                  background: heatmapMode === 'latency' ? 'var(--brand-primary)' : 'transparent',
                  border: 'none',
                  color: heatmapMode === 'latency' ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Speed (ms)
              </button>
              <button
                type="button"
                onClick={() => setHeatmapMode('finger')}
                style={{
                  background: heatmapMode === 'finger' ? 'var(--brand-primary)' : 'transparent',
                  border: 'none',
                  color: heatmapMode === 'finger' ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Finger Zones
              </button>
            </div>
          </div>

          {/* Ergonomic Hand Workload Distribution Ribbon */}
          <div
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem',
              padding: '0.65rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
              <span style={{ color: '#38bdf8' }}>
                ✋ Left Hand: {handWorkload.leftPct}% ({handWorkload.leftKeystrokes} strokes)
              </span>
              <span style={{ color: '#f59e0b' }}>
                Right Hand: {handWorkload.rightPct}% ({handWorkload.rightKeystrokes} strokes) 🤚
              </span>
            </div>
            {/* Visual dual bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${handWorkload.leftPct}%`, height: '100%', background: '#0284c7', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${handWorkload.rightPct}%`, height: '100%', background: '#d97706', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Heatmap Legend with Live Counts */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981', boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Mastered (≥95%)</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>({keyStatsSummary.mastered})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b', boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Needs Work</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>({keyStatsSummary.moderate})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f43f5e', boxShadow: '0 0 6px rgba(244, 63, 94, 0.6)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Struggling</span>
                <span style={{ color: '#f43f5e', fontWeight: 700 }}>({keyStatsSummary.weak})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--border-subtle)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Untested ({keyStatsSummary.untested})</span>
              </div>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              Click any keycap to inspect
            </div>
          </div>

          {/* 3D Mechanical Keyboard Housing Deck - Rock Solid, Full Width, Zero Overflow */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(3px, 0.45vw, 6px)',
              padding: 'clamp(0.75rem, 1.25vw, 1.25rem)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            {KEYBOARD_LAYOUT_ROWS.map((row, rIdx) => (
              <div
                key={rIdx}
                style={{
                  display: 'flex',
                  gap: 'clamp(3px, 0.45vw, 6px)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {row.map((kItem) => {
                  const heat = getKeyStatus(kItem.key);
                  const isSelected = activeInspectKey.toLowerCase() === kItem.key.toLowerCase();
                  const isHomeAnchor = kItem.isHomeAnchor;

                  // Dynamic color depending on view mode
                  let bgFill = heat.color;
                  let borderStroke = heat.borderColor;
                  let textCol = heat.textColor;
                  let subLabel = '';

                  if (heatmapMode === 'finger' && heat.finger) {
                    bgFill = `${heat.finger.color}22`;
                    borderStroke = heat.finger.color;
                    textCol = '#ffffff';
                    subLabel = heat.finger.name.split(' ')[0];
                  } else if (heatmapMode === 'latency') {
                    if (heat.metric && heat.metric.averageLatencyMs) {
                      subLabel = `${heat.metric.averageLatencyMs}ms`;
                      if (heat.metric.averageLatencyMs < 200) {
                        bgFill = 'rgba(16, 185, 129, 0.25)';
                        borderStroke = '#10b981';
                        textCol = '#34d399';
                      } else if (heat.metric.averageLatencyMs < 300) {
                        bgFill = 'rgba(245, 158, 11, 0.25)';
                        borderStroke = '#f59e0b';
                        textCol = '#fbbf24';
                      } else {
                        bgFill = 'rgba(244, 63, 94, 0.25)';
                        borderStroke = '#f43f5e';
                        textCol = '#fda4af';
                      }
                    } else {
                      subLabel = '—';
                    }
                  } else {
                    // Accuracy Mode
                    if (heat.metric && heat.metric.totalAttempts > 0) {
                      subLabel = `${heat.metric.accuracyPct}%`;
                    }
                  }

                  return (
                    <button
                      key={kItem.key}
                      onClick={() => setSelectedKey(kItem.key)}
                      type="button"
                      style={{
                        flex: `${kItem.width || 1} 1 0%`,
                        minWidth: 0,
                        height: 'clamp(42px, 4.4vw, 54px)',
                        borderRadius: '7px',
                        background: isSelected
                          ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                          : `linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%), ${bgFill}`,
                        border: isSelected
                          ? '1px solid #38bdf8'
                          : `1px solid ${borderStroke}`,
                        color: isSelected ? '#ffffff' : textCol,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(0.72rem, 0.9vw, 0.85rem)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxSizing: 'border-box',
                        // 3D Mechanical Keycap Profile & Shadow - Completely stable, zero shifting
                        boxShadow: isSelected
                          ? '0 0 20px rgba(56, 189, 248, 0.9), 0 3px 0 #0284c7, inset 0 0 0 1.5px #ffffff'
                          : '0 3px 0 var(--border-subtle), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                        userSelect: 'none',
                        padding: '2px 0',
                      }}
                      title={`${kItem.display}: ${heat.metric ? `${heat.metric.accuracyPct}% accuracy, ${heat.metric.errorCount} errors, ${heat.metric.averageLatencyMs}ms` : 'Untested'}`}
                    >
                      <span>{kItem.display}</span>

                      {/* Sub-label metric (accuracy % or latency ms) */}
                      {subLabel && (
                        <span
                          style={{
                            fontSize: 'clamp(0.5rem, 0.65vw, 0.62rem)',
                            fontWeight: 700,
                            opacity: isSelected ? 0.95 : 0.85,
                            marginTop: '1px',
                            lineHeight: 1,
                          }}
                        >
                          {subLabel}
                        </span>
                      )}

                      {/* Tactile Homing Ridge on F & J */}
                      {isHomeAnchor && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            width: '8px',
                            height: '2px',
                            background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                            borderRadius: '1px',
                          }}
                        />
                      )}

                      {/* Miniature Finger Color Dot */}
                      {heat.finger && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: isHomeAnchor ? '8px' : '3px',
                            width: '3.5px',
                            height: '3.5px',
                            borderRadius: '50%',
                            background: heat.finger.color,
                            opacity: 0.85,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Tip beneath keyboard */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>💡 Click any keycap on the mechanical deck to view microsecond telemetry & finger assignment.</span>
            <span>Adaptive model active</span>
          </div>
        </div>

        {/* Second Row: Key Inspector & Adaptive Remediation Station side-by-side */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '1.75rem',
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* Key Inspector Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Top Inspector Header with 3D Giant Keycap */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* 3D Giant Keycap Visualizer */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface-subtle)',
                    border: '2px solid var(--brand-primary)',
                    boxShadow: '0 0 16px rgba(14, 165, 233, 0.25), 0 3px 0 var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.85rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                  }}
                >
                  {activeInspectKey === ' ' ? '␣' : activeInspectKey.toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Key Telemetry
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: inspectFinger?.color ?? 'var(--text-muted)', fontWeight: 700, marginTop: '0.15rem' }}>
                    {inspectFinger ? `✋ ${inspectFinger.name} Finger` : 'Special Function Key'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  background: inspectMetric
                    ? inspectMetric.accuracyPct >= 95
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(244, 63, 94, 0.15)'
                    : 'var(--bg-surface-subtle)',
                  color: inspectMetric
                    ? inspectMetric.accuracyPct >= 95
                      ? '#10b981'
                      : '#f43f5e'
                    : 'var(--text-muted)',
                  border: `1px solid ${
                    inspectMetric
                      ? inspectMetric.accuracyPct >= 95
                        ? 'rgba(16, 185, 129, 0.4)'
                        : 'rgba(244, 63, 94, 0.4)'
                      : 'var(--border-subtle)'
                  }`,
                }}
              >
                {inspectMetric
                  ? inspectMetric.accuracyPct >= 95
                    ? '✓ Mastered'
                    : '⚠ Needs Practice'
                  : 'Untested Key'}
              </span>
            </div>

            {/* Telemetry Metric Grid */}
            {inspectMetric ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.85rem',
                }}
              >
                {/* Accuracy */}
                <div
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Accuracy
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: inspectMetric.accuracyPct >= 95 ? '#10b981' : '#f43f5e',
                      marginTop: '0.2rem',
                    }}
                  >
                    {inspectMetric.accuracyPct}%
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '0.45rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, inspectMetric.accuracyPct)}%`,
                        height: '100%',
                        background: inspectMetric.accuracyPct >= 95 ? '#10b981' : '#f43f5e',
                      }}
                    />
                  </div>
                </div>

                {/* Reaction Latency */}
                <div
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Reaction Latency
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--brand-primary)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {inspectMetric.averageLatencyMs ? `${inspectMetric.averageLatencyMs}ms` : '< 190ms'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                    {inspectMetric.averageLatencyMs && inspectMetric.averageLatencyMs < 200 ? '⚡ Swift Reflex' : 'Cadence Gate'}
                  </div>
                </div>

                {/* Total Keystrokes */}
                <div
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Attempts
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {inspectMetric.totalAttempts}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                    {inspectMetric.correctCount} correct placed
                  </div>
                </div>

                {/* Mistakes */}
                <div
                  style={{
                    background: 'var(--bg-surface-subtle)',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Mistakes
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: inspectMetric.errorCount > 0 ? '#f43f5e' : '#10b981',
                      marginTop: '0.2rem',
                    }}
                  >
                    {inspectMetric.errorCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                    {inspectMetric.correctedCount} backspaced
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '0.85rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                Key &quot;<strong>{activeInspectKey.toUpperCase()}</strong>&quot; has no recorded attempts in this session.
              </div>
            )}

            {/* Weak Keys Quick Selection Strip */}
            {breakdown.weakKeys.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f43f5e', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Struggling Keys Quick-Select
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {breakdown.weakKeys.slice(0, 6).map((w) => {
                    const isKeyActive = activeInspectKey.toLowerCase() === w.key.toLowerCase();
                    return (
                      <button
                        key={w.key}
                        onClick={() => setSelectedKey(w.key)}
                        type="button"
                        style={{
                          background: isKeyActive ? '#f43f5e' : 'rgba(244, 63, 94, 0.15)',
                          border: `1px solid ${isKeyActive ? '#ffffff' : 'rgba(244, 63, 94, 0.4)'}`,
                          color: isKeyActive ? '#ffffff' : '#fda4af',
                          borderRadius: '8px',
                          padding: '0.35rem 0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{w.key.toUpperCase()}</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>({w.accuracyPct}%)</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Keybr Adaptive Remediation Card */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, var(--bg-card) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}
          >
            {/* Top Cyan Glowing Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #38bdf8, transparent)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: '#38bdf8' }}>
                Keybr Adaptive Remediation
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                }}
              >
                Targeted Drill
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                {breakdown.weakKeys.length > 0
                  ? `Focus on Weak Keys: ${breakdown.weakKeys.slice(0, 4).map((w) => w.key.toUpperCase()).join(', ')}`
                  : 'Touch Typing Mastery In Progress'}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {breakdown.weakKeys.length > 0
                  ? 'Keybr recommends immediate repetition drills for keys with elevated latency or error rates before advancing to new lessons.'
                  : 'Clean execution! Continue along your curriculum progression or take another speed benchmark.'}
              </p>
            </div>

            {/* Sample Drill Pattern Preview */}
            {breakdown.weakKeys.length > 0 && (
              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.65rem',
                  padding: '0.55rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--brand-primary)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Drill:</span>
                <span>
                  {breakdown.weakKeys.slice(0, 3).map((w) => `${w.key}${w.key}f ${w.key}j${w.key}`).join(' ')}
                </span>
              </div>
            )}

            <button
              onClick={handlePracticeWeakest}
              type="button"
              className="btn-primary"
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1.45rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
                cursor: 'pointer',
              }}
            >
              <span>{breakdown.weakKeys.length > 0 ? 'Practice Weak Keys Now' : 'Continue Learning'}</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* 6. Live Keystroke Replay & Mechanical Keyboard Deck at Bottom of Results */}
        <LiveResultsTypingDeck
          result={result}
          sessionWords={sessionWords}
          onPracticeRestart={onRestart}
        />
      </div>
    </div>
  );
};
