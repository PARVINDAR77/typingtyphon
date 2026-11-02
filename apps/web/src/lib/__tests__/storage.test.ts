import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGuestSession,
  getGuestSessions,
  clearGuestSessions,
  getGuestStats,
  saveGuestLessonAttempt,
  getGuestCurriculumProgress,
  getPreferredDuration,
  savePreferredDuration,
} from '../storage';
import { EngineResult } from '@typingtyphon/contracts';

describe('Guest Storage Unit Tests', () => {
  beforeEach(async () => {
    // Mock localStorage in node environment
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => null,
    };
    (global as any).localStorage = mockLocalStorage;
    (global as any).window = {
      localStorage: mockLocalStorage,
      indexedDB: undefined, // test localStorage fallback in Node
    };
    await clearGuestSessions();
  });

  const mockResult: EngineResult = {
    durationSeconds: 60,
    elapsedSeconds: 60,
    grossWpm: 80,
    netWpm: 75.5,
    penalizedWpm: 75.5,
    accuracyPct: 98.2,
    consistencyPct: 88,
    totalKeystrokes: 400,
    correctKeystrokes: 390,
    errorCount: 2,
    uncorrectedErrors: 0,
    completedWordsCount: 70,
    timeSeries: [],
    rawIkiArray: [120, 110, 130],
    completedAt: '2026-10-16T12:00:00.000Z',
  };

  it('should save a completed guest session and generate deduplication hash', async () => {
    const saved = await saveGuestSession(mockResult, 'words');
    expect(saved).not.toBeNull();
    if (saved) {
      expect(saved.netWpm).toBe(75.5);
      expect(saved.dedupHash).toBeDefined();
      expect(saved.dedupHash.startsWith('hash_')).toBe(true);
      expect(saved.isMigrated).toBe(false);
    }

    const sessions = getGuestSessions();
    expect(sessions.length).toBe(1);
    expect(sessions[0].netWpm).toBe(75.5);
  });

  it('should compute accurate aggregate statistics from multiple sessions', async () => {
    await saveGuestSession(mockResult, 'words');
    await saveGuestSession(
      {
        ...mockResult,
        netWpm: 95.0,
        accuracyPct: 100,
        completedAt: '2026-10-16T12:05:00.000Z',
      },
      'words'
    );

    const stats = getGuestStats();
    expect(stats.totalCompletedTests).toBe(2);
    expect(stats.bestNetWpm).toBe(95.0);
    // Average of 75.5 and 95.0 = 85.3
    expect(stats.averageNetWpm).toBe(85.3);
    expect(stats.bestAccuracyPct).toBe(100);
  });

  it('should prune sessions exceeding the maximum limit of 50 (FIFO)', async () => {
    for (let i = 0; i < 55; i++) {
      await saveGuestSession(
        {
          ...mockResult,
          netWpm: i + 1,
          completedAt: new Date(Date.now() + i * 1000).toISOString(),
        },
        'words'
      );
    }

    const sessions = getGuestSessions();
    expect(sessions.length).toBe(50);
    // Most recent session is prepended at index 0 (netWpm = 55)
    expect(sessions[0].netWpm).toBe(55);
  });

  it('should completely clear local guest sessions', async () => {
    await saveGuestSession(mockResult, 'words');
    expect(getGuestSessions().length).toBe(1);

    await clearGuestSessions();
    expect(getGuestSessions().length).toBe(0);
    expect(getGuestStats().totalCompletedTests).toBe(0);
  });

  it('should accurately evaluate and persist guest curriculum lesson progress', () => {
    const threshold = { minAccuracyPct: 96.0, minWpm: 15.0 };

    // Initial failed attempt (accuracy too low)
    const failAttempt: EngineResult = {
      ...mockResult,
      accuracyPct: 92.0,
      netWpm: 18.0,
    };
    const failProgress = saveGuestLessonAttempt('lesson-1-1', failAttempt, threshold);
    expect(failProgress.passed).toBe(false);
    expect(failProgress.attemptsCount).toBe(1);
    expect(failProgress.bestAccuracyPct).toBe(92.0);

    // Second passing attempt
    const passAttempt: EngineResult = {
      ...mockResult,
      accuracyPct: 97.5,
      netWpm: 22.0,
    };
    const passProgress = saveGuestLessonAttempt('lesson-1-1', passAttempt, threshold);
    expect(passProgress.passed).toBe(true);
    expect(passProgress.attemptsCount).toBe(2);
    expect(passProgress.bestAccuracyPct).toBe(97.5);
    expect(passProgress.bestNetWpm).toBe(22.0);

    // Verify retrieval
    const allProgress = getGuestCurriculumProgress();
    expect(allProgress['lesson-1-1'].passed).toBe(true);
    expect(allProgress['lesson-1-1'].bestNetWpm).toBe(22.0);
  });

  it('should mark specific sessions as migrated while preserving unmigrated records intact', async () => {
    const s1 = await saveGuestSession({ ...mockResult, netWpm: 70 }, 'words');
    const s2 = await saveGuestSession({ ...mockResult, netWpm: 80, completedAt: '2026-10-16T12:01:00.000Z' }, 'words');

    expect(s1).not.toBeNull();
    expect(s2).not.toBeNull();

    const { markGuestSessionsMigrated } = await import('../storage');

    // Simulate partial migration: only s1 was confirmed migrated by the API
    await markGuestSessionsMigrated([s1!.localId]);

    const updated = getGuestSessions();
    const foundS1 = updated.find((s) => s.localId === s1!.localId);
    const foundS2 = updated.find((s) => s.localId === s2!.localId);

    expect(foundS1?.isMigrated).toBe(true);
    // s2 was not migrated and remains intact for subsequent retries
    expect(foundS2?.isMigrated).toBe(false);
  });

  it('should record, merge, and categorize per-key performance metrics across sessions', async () => {
    const { getAggregateKeyAnalytics, getKeyPerformanceBreakdown } = await import('../storage');

    // First session with 10 attempts on 'f' (high accuracy) and 6 attempts on 'e' (low accuracy)
    await saveGuestSession(
      {
        ...mockResult,
        perKeyMetrics: {
          f: {
            key: 'f',
            totalAttempts: 10,
            correctCount: 10,
            errorCount: 0,
            correctedCount: 0,
            accuracyPct: 100.0,
            averageLatencyMs: 150,
            sampleConfidence: 'low',
          },
          e: {
            key: 'e',
            totalAttempts: 6,
            correctCount: 4,
            errorCount: 2,
            correctedCount: 1,
            accuracyPct: 66.7,
            averageLatencyMs: 200,
            sampleConfidence: 'low',
          },
          z: {
            key: 'z',
            totalAttempts: 2, // Insufficient sample size
            correctCount: 1,
            errorCount: 1,
            correctedCount: 0,
            accuracyPct: 50.0,
            averageLatencyMs: 300,
            sampleConfidence: 'insufficient',
          },
        },
      },
      'words'
    );

    const analytics = getAggregateKeyAnalytics();
    expect(analytics['f'].totalAttempts).toBe(10);
    expect(analytics['e'].totalAttempts).toBe(6);
    expect(analytics['z'].totalAttempts).toBe(2);

    const breakdown = getKeyPerformanceBreakdown(analytics);
    // 'e' is weak (< 90% accuracy and >= 2 errors)
    expect(breakdown.weakKeys.map((k) => k.key)).toContain('e');
    // 'f' is strong (>= 96% accuracy)
    expect(breakdown.strongKeys.map((k) => k.key)).toContain('f');
    // 'z' has insufficient data and is excluded from definitive weak categorization
    expect(breakdown.weakKeys.map((k) => k.key)).not.toContain('z');
    expect(breakdown.insufficientDataKeys.map((k) => k.key)).toContain('z');
  });

  it('should never double-count per-key metrics when saveGuestLessonAttempt and saveGuestSession are called together', async () => {
    const { recordKeyStats, getAggregateKeyAnalytics } = await import('../storage');

    const testResult: EngineResult = {
      ...mockResult,
      completedAt: '2026-10-16T15:00:00.000Z',
      netWpm: 60,
      totalKeystrokes: 100,
      perKeyMetrics: {
        k: {
          key: 'k',
          totalAttempts: 12,
          correctCount: 12,
          errorCount: 0,
          correctedCount: 0,
          accuracyPct: 100,
          averageLatencyMs: 140,
          sampleConfidence: 'low',
        },
      },
    };

    // 1. Simulate lesson completion calling saveGuestLessonAttempt
    saveGuestLessonAttempt('lesson-1-1', testResult, { minAccuracyPct: 90, minWpm: 15 });

    // 2. Simulate page handler also persisting to session history
    await saveGuestSession(testResult, 'curriculum-intro');

    // 3. Explicitly attempt redundant invocation
    recordKeyStats(testResult);

    const stats = getAggregateKeyAnalytics();
    // Verify attempts on 'k' remained exactly 12 and was not doubled to 24 or 36
    expect(stats['k'].totalAttempts).toBe(12);
    expect(stats['k'].correctCount).toBe(12);
  });
  it('should default preferred duration to 15 seconds when unconfigured', () => {
    expect(getPreferredDuration()).toBe(15);
  });

  it('should persist and retrieve custom duration preferences (15, 30, 60, 120)', () => {
    savePreferredDuration(30);
    expect(getPreferredDuration()).toBe(30);

    savePreferredDuration(120);
    expect(getPreferredDuration()).toBe(120);

    savePreferredDuration(15);
    expect(getPreferredDuration()).toBe(15);
  });

  it('should fallback to 15 seconds if storage contains an invalid duration', () => {
    (global as any).localStorage.setItem('typingtyphon_preferred_duration', '999');
    expect(getPreferredDuration()).toBe(15);

    (global as any).localStorage.setItem('typingtyphon_preferred_duration', 'invalid');
    expect(getPreferredDuration()).toBe(15);
  });
});
