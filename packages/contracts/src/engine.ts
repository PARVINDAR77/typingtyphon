/**
 * Typing Typhon — Core Engine Types & Standardized Mathematical Formulas
 */

export type TestMode = 'words' | 'sentences' | 'quotes' | 'numbers' | 'punctuation' | 'code' | 'custom';
export type TestDuration = 15 | 30 | 60 | 120 | number;
export type BackspaceMode = 'standard' | 'confidence' | 'word';
export type EngineStatus = 'idle' | 'running' | 'paused' | 'completed';
export type CharacterState = 'untouched' | 'correct' | 'incorrect' | 'extra' | 'missed';

export interface CharacterItem {
  char: string;
  state: CharacterState;
  inputChar?: string;
}

export interface WordItem {
  id: string;
  originalText: string;
  chars: CharacterItem[];
  isCompleted: boolean;
  hasError: boolean;
}

export interface SecondSnapshot {
  second: number;
  rollingWpm: number;
  cumulativeNetWpm: number;
  cumulativeGrossWpm: number;
  errorsThisSecond: number;
}

export interface KeyTelemetry {
  key: string;
  targetKey: string;
  timestamp: number;
  ikiMs: number; // Inter-keystroke interval
  isCorrect: boolean;
}

export interface EngineConfig {
  durationSeconds: number;
  mode: TestMode;
  backspaceMode?: BackspaceMode;
  confidenceMode?: boolean;
}

import { KeyMetricAggregate } from './analytics';

export interface EngineResult {
  durationSeconds: number;
  elapsedSeconds: number;
  grossWpm: number;
  netWpm: number;
  penalizedWpm: number;
  accuracyPct: number;
  consistencyPct: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  uncorrectedErrors: number;
  completedWordsCount: number;
  timeSeries: SecondSnapshot[];
  rawIkiArray: number[];
  perKeyMetrics?: Record<string, KeyMetricAggregate>;
  completedAt: string;
}

/**
 * STANDARD WORDS CONVENTION:
 * 1 standard word = 5 characters
 */
export const CHARS_PER_STANDARD_WORD = 5;

/**
 * Calculates Gross Words Per Minute (Raw speed)
 * @param totalInputCharacters Total valid characters typed (excluding backspaces)
 * @param elapsedSeconds Elapsed time in seconds
 */
export function calculateGrossWpm(totalInputCharacters: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || totalInputCharacters <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const grossWords = totalInputCharacters / CHARS_PER_STANDARD_WORD;
  return Number((grossWords / elapsedMinutes).toFixed(2));
}

/**
 * Calculates Standard Net Words Per Minute (Headline metric)
 * @param correctCharacters Total correct characters placed
 * @param elapsedSeconds Elapsed time in seconds
 */
export function calculateNetWpm(correctCharacters: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctCharacters <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const netWords = correctCharacters / CHARS_PER_STANDARD_WORD;
  return Number(Math.max(0, netWords / elapsedMinutes).toFixed(2));
}

/**
 * Calculates Post-Test Penalized Net WPM (Optional competitive metric)
 * Deducts 1 standard word per uncorrected error remaining in completed words
 */
export function calculatePenalizedWpm(
  correctCharacters: number,
  uncorrectedErrors: number,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0 || correctCharacters <= 0) return 0;
  const elapsedMinutes = elapsedSeconds / 60;
  const netWords = correctCharacters / CHARS_PER_STANDARD_WORD;
  const penalizedWords = Math.max(0, netWords - uncorrectedErrors);
  return Number((penalizedWords / elapsedMinutes).toFixed(2));
}

/**
 * Calculates Accuracy Percentage
 * @param correctKeystrokes Keystrokes that matched the target character
 * @param totalKeystrokes Total attempts made (including errors and corrections)
 */
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100.0;
  const pct = (correctKeystrokes / totalKeystrokes) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(2));
}

/**
 * Calculates Typing Rhythm Consistency (0-100%)
 * Consistency = max(0, 100 - (StandardDeviation / Mean * 100))
 * @param ikis Inter-keystroke intervals in milliseconds
 */
export function calculateConsistency(ikis: number[]): number {
  if (ikis.length < 3) return 100.0;
  const mean = ikis.reduce((sum, v) => sum + v, 0) / ikis.length;
  if (mean <= 0) return 100.0;
  const variance = ikis.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (ikis.length - 1);
  const stdDev = Math.sqrt(variance);
  const cov = (stdDev / mean) * 100;
  return Number(Math.max(0, Math.min(100, 100 - cov)).toFixed(1));
}
