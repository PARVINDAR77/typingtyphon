import {
  EngineResult,
  GuestSessionMigrationItem,
  UserProgressSummaryDto,
  KeyMetricAggregate,
  ConfidenceLevel,
  UserProfileDto,
} from '@typingtyphon/contracts';

const GUEST_STORAGE_KEY = 'typingtyphon_guest_sessions_v1';
const LAST_WORDS_STORAGE_KEY = 'typingtyphon_last_session_words';
const DB_NAME = 'typingtyphon_guest_db';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const MAX_GUEST_SESSIONS = 50;

/**
 * Persist the words list from the most recent completed typing test session.
 */
export function saveLastSessionWords(words: string[]): void {
  if (typeof window === 'undefined' || !words || words.length === 0) return;
  try {
    localStorage.setItem(LAST_WORDS_STORAGE_KEY, JSON.stringify(words));
  } catch (err) {
    console.error('Failed to save last session words:', err);
  }
}

/**
 * Retrieve the words list from the most recent completed typing test session.
 */
export function getLastSessionWords(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LAST_WORDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Deterministic hash generator for deduplication during cloud migration.
 */
function generateSessionHash(item: { completedAt: string; durationSeconds: number; netWpm: number; mode: string }): string {
  const raw = `${item.completedAt}_${item.durationSeconds}_${item.netWpm}_${item.mode}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Open or upgrade the client-side IndexedDB database.
 */
function openIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
          store.createIndex('clientTimestamp', 'clientTimestamp', { unique: false });
          store.createIndex('dedupHash', 'dedupHash', { unique: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB unavailable; using localStorage fallback.');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save a session to both LocalStorage (synchronous) and IndexedDB (asynchronous).
 */
export async function saveGuestSession(result: EngineResult, mode = 'words'): Promise<GuestSessionMigrationItem | null> {
  if (typeof window === 'undefined') return null;

  try {
    const existing = getGuestSessions();
    const id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dedupHash = generateSessionHash({
      completedAt: result.completedAt,
      durationSeconds: result.durationSeconds,
      netWpm: result.netWpm,
      mode,
    });

    const newItem: GuestSessionMigrationItem = {
      localId: id,
      sessionType: 'speed_test',
      durationSeconds: result.durationSeconds,
      netWpm: result.netWpm,
      grossWpm: result.grossWpm,
      accuracyPct: result.accuracyPct,
      totalKeystrokes: result.totalKeystrokes,
      correctKeystrokes: result.correctKeystrokes,
      errorCount: result.errorCount,
      mode: mode as any,
      timeSeries: result.timeSeries,
      clientTimestamp: result.completedAt,
      isMigrated: false,
      dedupHash,
    };

    // 1. Synchronously persist to LocalStorage (FIFO 50 records)
    const updated = [newItem, ...existing].slice(0, MAX_GUEST_SESSIONS);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));

    // Persist per-key metrics
    recordKeyStats(result);

    // 2. Asynchronously persist to IndexedDB
    const db = await openIndexedDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(newItem);
        tx.oncomplete = () => db.close();
      } catch (idbErr) {
        console.warn('Could not write to IndexedDB store:', idbErr);
      }
    }

    return newItem;
  } catch (err) {
    console.error('Failed to save guest session:', err);
    return null;
  }
}

/**
 * Synchronous read from LocalStorage for immediate UI hydration.
 */
export function getGuestSessions(): GuestSessionMigrationItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read guest sessions:', err);
    return [];
  }
}

/**
 * Asynchronous read directly from IndexedDB with fallback to LocalStorage.
 */
export async function getGuestSessionsAsync(): Promise<GuestSessionMigrationItem[]> {
  const db = await openIndexedDb();
  if (!db) {
    return getGuestSessions();
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        db.close();
        const records = req.result as GuestSessionMigrationItem[];
        // Sort descending by clientTimestamp
        records.sort((a, b) => new Date(b.clientTimestamp).getTime() - new Date(a.clientTimestamp).getTime());
        resolve(records.slice(0, MAX_GUEST_SESSIONS));
      };

      req.onerror = () => {
        db.close();
        resolve(getGuestSessions());
      };
    } catch {
      resolve(getGuestSessions());
    }
  });
}

/**
 * Clear all guest practice history across both storage layers.
 */
export async function clearGuestSessions(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    clearGuestKeyAnalytics();
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
  }

  const db = await openIndexedDb();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => db.close();
    } catch (err) {
      console.warn('Failed to clear IndexedDB:', err);
    }
  }
}

/**
 * Safely marks specific guest sessions as migrated across both storage layers,
 * preserving any unmigrated sessions for retry if partial migration occurs.
 */
export async function markGuestSessionsMigrated(migratedIds: string[]): Promise<void> {
  if (typeof window === 'undefined' || !migratedIds || migratedIds.length === 0) return;

  const idSet = new Set(migratedIds);

  // 1. Update LocalStorage
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const items: GuestSessionMigrationItem[] = JSON.parse(raw);
      const updated = items.map((item) => {
        if (idSet.has(item.localId)) {
          return { ...item, isMigrated: true };
        }
        return item;
      });
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to update migrated sessions in localStorage:', err);
  }

  // 2. Update IndexedDB
  const db = await openIndexedDb();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result as GuestSessionMigrationItem[];
        for (const record of records) {
          if (idSet.has(record.localId)) {
            store.put({ ...record, isMigrated: true });
          }
        }
      };

      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    } catch (err) {
      console.warn('Failed to update migrated records in IndexedDB:', err);
    }
  }
}

/**
 * Loads a batch of sessions directly into storage (both LocalStorage and IndexedDB).
 */
export async function seedGuestSessions(
  sessions: GuestSessionMigrationItem[],
  keyMetrics?: Record<string, KeyMetricAggregate>
): Promise<void> {
  if (typeof window === 'undefined') return;

  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(sessions));
  if (keyMetrics) {
    localStorage.setItem(GUEST_KEY_ANALYTICS_KEY, JSON.stringify(keyMetrics));
  }

  const db = await openIndexedDb();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      for (const item of sessions) {
        store.put(item);
      }
      tx.oncomplete = () => db.close();
    } catch (e) {
      console.warn('Failed to seed IndexedDB:', e);
    }
  }
}

/**
 * Computes aggregate summary statistics from local history.
 */
export function getGuestStats(): UserProgressSummaryDto {
  const sessions = getGuestSessions();
  if (sessions.length === 0) {
    return {
      totalCompletedTests: 0,
      totalPracticeTimeSeconds: 0,
      bestNetWpm: 0,
      averageNetWpm: 0,
      bestAccuracyPct: 100,
      averageAccuracyPct: 100,
      currentStreakDays: 0,
    };
  }

  let totalPracticeTime = 0;
  let totalWpm = 0;
  let totalAcc = 0;
  let bestWpm = 0;
  let bestAcc = 0;

  for (const s of sessions) {
    totalPracticeTime += s.durationSeconds;
    totalWpm += s.netWpm;
    totalAcc += s.accuracyPct;
    if (s.netWpm > bestWpm) bestWpm = s.netWpm;
    if (s.accuracyPct > bestAcc) bestAcc = s.accuracyPct;
  }

  const avgWpm = Number((totalWpm / sessions.length).toFixed(1));
  const avgAcc = Number((totalAcc / sessions.length).toFixed(1));

  return {
    totalCompletedTests: sessions.length,
    totalPracticeTimeSeconds: totalPracticeTime,
    bestNetWpm: bestWpm,
    averageNetWpm: avgWpm,
    bestAccuracyPct: bestAcc,
    averageAccuracyPct: avgAcc,
    currentStreakDays: sessions.length > 0 ? 1 : 0,
    lastTestDate: sessions[0]?.clientTimestamp,
  };
}

const GUEST_CURRICULUM_KEY = 'typingtyphon_guest_curriculum_v1';

export interface LessonProgress {
  lessonId: string;
  bestAccuracyPct: number;
  bestNetWpm: number;
  passed: boolean;
  attemptsCount: number;
  lastAttemptDate: string;
}

/**
 * Retrieves all saved curriculum lesson progress records for the guest user.
 */
export function getGuestCurriculumProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GUEST_CURRICULUM_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read curriculum progress from localStorage:', err);
    return {};
  }
}

/**
 * Records a curriculum lesson attempt, evaluating pass/fail status and updating personal bests.
 */
export function saveGuestLessonAttempt(
  lessonId: string,
  result: EngineResult,
  passThreshold: { minAccuracyPct: number; minWpm: number }
): LessonProgress {
  const allProgress = getGuestCurriculumProgress();
  const existing = allProgress[lessonId];

  const isPass = result.accuracyPct >= passThreshold.minAccuracyPct && result.netWpm >= passThreshold.minWpm;
  const passed = existing?.passed || isPass;
  const bestAccuracyPct = Math.max(existing?.bestAccuracyPct || 0, result.accuracyPct);
  const bestNetWpm = Math.max(existing?.bestNetWpm || 0, result.netWpm);
  const attemptsCount = (existing?.attemptsCount || 0) + 1;

  const updated: LessonProgress = {
    lessonId,
    bestAccuracyPct,
    bestNetWpm,
    passed,
    attemptsCount,
    lastAttemptDate: new Date().toISOString(),
  };

  allProgress[lessonId] = updated;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GUEST_CURRICULUM_KEY, JSON.stringify(allProgress));
    } catch (err) {
      console.warn('Failed to save curriculum progress to localStorage:', err);
    }
  }

  return updated;
}

const GUEST_KEY_ANALYTICS_KEY = 'typingtyphon_key_analytics_v1';
const GUEST_RECORDED_KEY_SESSIONS_KEY = 'typingtyphon_recorded_key_sessions_v1';

/**
 * Retrieves all stored per-key telemetry aggregates for the guest.
 */
export function getAggregateKeyAnalytics(): Record<string, KeyMetricAggregate> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(GUEST_KEY_ANALYTICS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read key analytics from localStorage:', err);
    return {};
  }
}

/**
 * Merges per-key metrics from a completed session into the aggregate telemetry store.
 * Strictly idempotent: prevents double-counting if invoked multiple times with the same result.
 */
export function recordKeyStats(result: EngineResult): void {
  if (typeof window === 'undefined' || !result.perKeyMetrics) return;

  const resultObj = result as unknown as { _keyStatsRecorded?: boolean };
  if (resultObj._keyStatsRecorded) return;

  try {
    const dedupHash = `${result.completedAt}-${result.netWpm}-${result.totalKeystrokes}`;
    const rawSessions = localStorage.getItem(GUEST_RECORDED_KEY_SESSIONS_KEY);
    const recordedHashes: string[] = rawSessions ? JSON.parse(rawSessions) : [];
    if (recordedHashes.includes(dedupHash)) {
      resultObj._keyStatsRecorded = true;
      return;
    }

    recordedHashes.unshift(dedupHash);
    localStorage.setItem(GUEST_RECORDED_KEY_SESSIONS_KEY, JSON.stringify(recordedHashes.slice(0, 50)));
    resultObj._keyStatsRecorded = true;

    const allStats = getAggregateKeyAnalytics();

    for (const [key, metric] of Object.entries(result.perKeyMetrics)) {
      const existing = allStats[key];
      if (!existing) {
        allStats[key] = { ...metric };
      } else {
        const totalAttempts = existing.totalAttempts + metric.totalAttempts;
        const correctCount = existing.correctCount + metric.correctCount;
        const errorCount = existing.errorCount + metric.errorCount;
        const correctedCount = existing.correctedCount + metric.correctedCount;
        const accuracyPct = totalAttempts > 0 ? Number(((correctCount / totalAttempts) * 100).toFixed(1)) : 100;

        // Weighted latency calculation
        const totalOldLatency = existing.totalAttempts * existing.averageLatencyMs;
        const totalNewLatency = metric.totalAttempts * metric.averageLatencyMs;
        const averageLatencyMs = totalAttempts > 0 ? Math.round((totalOldLatency + totalNewLatency) / totalAttempts) : 0;

        let sampleConfidence: ConfidenceLevel = 'insufficient';
        if (totalAttempts >= 30) sampleConfidence = 'high';
        else if (totalAttempts >= 15) sampleConfidence = 'moderate';
        else if (totalAttempts >= 5) sampleConfidence = 'low';

        allStats[key] = {
          key,
          totalAttempts,
          correctCount,
          errorCount,
          correctedCount,
          accuracyPct,
          averageLatencyMs,
          sampleConfidence,
          lastPracticed: new Date().toISOString(),
        };
      }
    }

    localStorage.setItem(GUEST_KEY_ANALYTICS_KEY, JSON.stringify(allStats));
  } catch (err) {
    console.warn('Failed to persist key analytics:', err);
  }
}

/**
 * Clears all stored key analytics.
 */
export function clearGuestKeyAnalytics(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_KEY_ANALYTICS_KEY);
    localStorage.removeItem(GUEST_RECORDED_KEY_SESSIONS_KEY);
  } catch (err) {
    console.warn('Failed to clear key analytics:', err);
  }
}

export interface KeyPerformanceBreakdown {
  weakKeys: KeyMetricAggregate[];
  slowKeys: KeyMetricAggregate[];
  strongKeys: KeyMetricAggregate[];
  insufficientDataKeys: KeyMetricAggregate[];
  overallAverageLatencyMs: number;
  totalTrackedKeys: number;
  confidentKeysCount: number;
}

/**
 * Categorizes aggregate key metrics into strengths, weaknesses, and slow keys
 * while strictly gating insufficient samples (< 5 attempts).
 */
export function getKeyPerformanceBreakdown(analytics?: Record<string, KeyMetricAggregate>): KeyPerformanceBreakdown {
  const stats = analytics || getAggregateKeyAnalytics();
  const list = Object.values(stats);

  const confident = list.filter((k) => k.sampleConfidence !== 'insufficient');
  const insufficient = list.filter((k) => k.sampleConfidence === 'insufficient');

  // Overall average latency across confident keys
  const avgLatency = confident.length > 0
    ? Math.round(confident.reduce((sum, k) => sum + k.averageLatencyMs, 0) / confident.length)
    : 0;

  // Weak keys: accuracy < 90% and errorCount >= 2
  const weakKeys = confident
    .filter((k) => k.accuracyPct < 90.0 && k.errorCount >= 2)
    .sort((a, b) => a.accuracyPct - b.accuracyPct || b.errorCount - a.errorCount);

  // Slow keys: accuracy >= 90% but latency > 1.6x overall avg and > 250ms
  const slowKeys = confident
    .filter((k) => k.accuracyPct >= 90.0 && k.averageLatencyMs > 1.6 * avgLatency && k.averageLatencyMs > 250)
    .sort((a, b) => b.averageLatencyMs - a.averageLatencyMs);

  // Strong keys: accuracy >= 96%
  const strongKeys = confident
    .filter((k) => k.accuracyPct >= 96.0 && (avgLatency === 0 || k.averageLatencyMs <= 1.3 * avgLatency))
    .sort((a, b) => b.accuracyPct - a.accuracyPct || b.totalAttempts - a.totalAttempts);

  return {
    weakKeys,
    slowKeys,
    strongKeys,
    insufficientDataKeys: insufficient,
    overallAverageLatencyMs: avgLatency,
    totalTrackedKeys: list.length,
    confidentKeysCount: confident.length,
  };
}

const USER_PROFILE_STORAGE_KEY = 'typingtyphon_active_user_profile';

/**
 * Persist the authenticated user profile to local storage for instant client-side retrieval.
 */
export function saveUserProfile(user: UserProfileDto): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

/**
 * Retrieve the cached authenticated user profile from local storage.
 */
export function getUserProfile(): UserProfileDto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfileDto;
  } catch {
    return null;
  }
}

/**
 * Remove cached user profile from local storage upon logout.
 */
export function clearUserProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  } catch {
    // Ignore error on clearing
  }
}


