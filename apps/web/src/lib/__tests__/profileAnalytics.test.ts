import { describe, it, expect } from 'vitest';
import {
  cumulativeStdNormal,
  calculateTypingPercentile,
  calculateAccuracyPercentile,
  computeAllTimeAndTodayStats,
  computeAccuracyStreaks,
  computeKeyMasteryMatrix,
  computeSpeedTimeline,
  computeActivityCalendar,
  getTypingMasteryTier,
} from '../profileAnalytics';
import { GuestSessionMigrationItem } from '@typingtyphon/contracts';

describe('profileAnalytics', () => {
  describe('Gaussian Percentile Calculation', () => {
    it('calculates 50th percentile for median typing speed of 42 WPM', () => {
      const p = calculateTypingPercentile(42, 42, 16);
      expect(p).toBe(50.0);
    });

    it('calculates expected percentile for fast typist (58 WPM is ~84.1%)', () => {
      const p = calculateTypingPercentile(58, 42, 16);
      // z = (58 - 42) / 16 = 1.0; CDF(1) ~ 0.8413 => 84.1%
      expect(p).toBeCloseTo(84.1, 1);
    });

    it('calculates top percentile for high speed (90 WPM)', () => {
      const p = calculateTypingPercentile(90, 42, 16);
      expect(p).toBeGreaterThan(99.0);
    });

    it('handles edge cases gracefully', () => {
      expect(calculateTypingPercentile(0)).toBe(0);
      expect(calculateAccuracyPercentile(94)).toBe(50.0);
    });
  });

  describe('Stats Aggregation', () => {
    const mockSessions: GuestSessionMigrationItem[] = [
      {
        localId: '1',
        sessionType: 'speed_test',
        durationSeconds: 60,
        netWpm: 50,
        grossWpm: 52,
        accuracyPct: 96,
        totalKeystrokes: 250,
        correctKeystrokes: 240,
        errorCount: 10,
        mode: 'words',
        clientTimestamp: new Date().toISOString(), // Today
        isMigrated: false,
        dedupHash: 'h1',
      },
      {
        localId: '2',
        sessionType: 'speed_test',
        durationSeconds: 60,
        netWpm: 60,
        grossWpm: 62,
        accuracyPct: 98,
        totalKeystrokes: 300,
        correctKeystrokes: 294,
        errorCount: 6,
        mode: 'words',
        clientTimestamp: new Date().toISOString(), // Today
        isMigrated: false,
        dedupHash: 'h2',
      },
      {
        localId: '3',
        sessionType: 'speed_test',
        durationSeconds: 30,
        netWpm: 40,
        grossWpm: 45,
        accuracyPct: 92,
        totalKeystrokes: 150,
        correctKeystrokes: 138,
        errorCount: 12,
        mode: 'punctuation',
        clientTimestamp: '2026-01-01T12:00:00.000Z', // Past date
        isMigrated: false,
        dedupHash: 'h3',
      },
    ];

    it('computes correct all-time and today metrics', () => {
      const { allTime, today, deltas } = computeAllTimeAndTodayStats(mockSessions);

      expect(allTime.totalCompletedTests).toBe(3);
      expect(allTime.bestNetWpm).toBe(60);
      expect(allTime.averageNetWpm).toBe(50); // (50 + 60 + 40) / 3
      expect(allTime.bestAccuracyPct).toBe(98);

      expect(today.totalCompletedTests).toBe(2);
      expect(today.bestNetWpm).toBe(60);
      expect(today.averageNetWpm).toBe(55); // (50 + 60) / 2

      expect(deltas.hasTodayActivity).toBe(true);
      expect(deltas.wpmDiff).toBe(5); // 55 - 50 = +5
    });

    it('filters sessions by test mode', () => {
      const { allTime } = computeAllTimeAndTodayStats(mockSessions, 'punctuation');
      expect(allTime.totalCompletedTests).toBe(1);
      expect(allTime.bestNetWpm).toBe(40);
    });
  });

  describe('Accuracy Streaks', () => {
    it('computes accuracy streaks correctly', () => {
      const mockSessions: GuestSessionMigrationItem[] = [
        {
          localId: '1',
          sessionType: 'speed_test',
          durationSeconds: 60,
          netWpm: 50,
          grossWpm: 50,
          accuracyPct: 96,
          totalKeystrokes: 200,
          correctKeystrokes: 192,
          errorCount: 8,
          mode: 'words',
          clientTimestamp: '2026-10-20T10:00:00Z',
          isMigrated: false,
          dedupHash: 'h1',
        },
        {
          localId: '2',
          sessionType: 'speed_test',
          durationSeconds: 60,
          netWpm: 52,
          grossWpm: 52,
          accuracyPct: 99,
          totalKeystrokes: 200,
          correctKeystrokes: 198,
          errorCount: 2,
          mode: 'words',
          clientTimestamp: '2026-10-21T10:00:00Z',
          isMigrated: false,
          dedupHash: 'h2',
        },
        {
          localId: '3',
          sessionType: 'speed_test',
          durationSeconds: 60,
          netWpm: 55,
          grossWpm: 55,
          accuracyPct: 100,
          totalKeystrokes: 200,
          correctKeystrokes: 200,
          errorCount: 0,
          mode: 'words',
          clientTimestamp: '2026-10-22T10:00:00Z',
          isMigrated: false,
          dedupHash: 'h3',
        },
      ];

      const streaks = computeAccuracyStreaks(mockSessions);
      expect(streaks.streak95.current).toBe(3);
      expect(streaks.streak95.longest).toBe(3);
      expect(streaks.streak98.current).toBe(2);
      expect(streaks.streak100.current).toBe(1);
    });
  });

  describe('Key Mastery Matrix', () => {
    it('generates 26 rows for alphabet A-Z', () => {
      const matrix = computeKeyMasteryMatrix([], {});
      expect(matrix).toHaveLength(26);
      expect(matrix[0].letter).toBe('a');
      expect(matrix[25].letter).toBe('z');
    });
  });

  describe('Speed Progress & Activity Calendar', () => {
    it('computes rolling average in speed timeline', () => {
      const mockSessions: GuestSessionMigrationItem[] = [
        { localId: '1', sessionType: 'speed_test', durationSeconds: 60, netWpm: 40, grossWpm: 42, accuracyPct: 95, totalKeystrokes: 100, correctKeystrokes: 95, errorCount: 5, mode: 'words', clientTimestamp: '2026-10-20T10:00:00Z', isMigrated: false, dedupHash: 'h1' },
        { localId: '2', sessionType: 'speed_test', durationSeconds: 60, netWpm: 60, grossWpm: 62, accuracyPct: 96, totalKeystrokes: 100, correctKeystrokes: 96, errorCount: 4, mode: 'words', clientTimestamp: '2026-10-21T10:00:00Z', isMigrated: false, dedupHash: 'h2' },
      ];

      const timeline = computeSpeedTimeline(mockSessions);
      expect(timeline).toHaveLength(2);
      expect(timeline[0].movingAvgWpm).toBe(40);
      expect(timeline[1].movingAvgWpm).toBe(50); // (40 + 60) / 2
    });

    it('evaluates mastery tier appropriately', () => {
      expect(getTypingMasteryTier(90, 98).title).toBe('Typhon Grandmaster');
      expect(getTypingMasteryTier(55, 93).title).toBe('Pro Typist');
      expect(getTypingMasteryTier(25, 80).title).toBe('Apprentice Typist');
    });
  });
});
