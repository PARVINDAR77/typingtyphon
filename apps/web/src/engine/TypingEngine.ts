import {
  CharacterItem,
  ConfidenceLevel,
  EngineConfig,
  EngineResult,
  EngineStatus,
  KeyMetricAggregate,
  SecondSnapshot,
  WordItem,
  calculateAccuracy,
  calculateConsistency,
  calculateGrossWpm,
  calculateNetWpm,
  calculatePenalizedWpm,
} from '@typingtyphon/contracts';

interface InternalKeyStats {
  attempts: number;
  correct: number;
  errors: number;
  corrected: number;
  totalLatencyMs: number;
  latencyCount: number;
}

export interface TypingEngineState {
  status: EngineStatus;
  words: WordItem[];
  activeWordIndex: number;
  activeCharIndex: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  durationSeconds: number;
  grossWpm: number;
  netWpm: number;
  accuracyPct: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  completedWordsCount: number;
}

export class TypingEngine {
  private words: WordItem[] = [];
  private activeWordIndex = 0;
  private activeCharIndex = 0;
  private status: EngineStatus = 'idle';
  private config: EngineConfig;
  private elapsedSeconds = 0;
  private totalKeystrokes = 0;
  private correctKeystrokes = 0;
  private errorCount = 0;
  private completedWordsCount = 0;
  private lastKeystrokeTime = 0;
  private ikis: number[] = [];
  private timeSeries: SecondSnapshot[] = [];
  private lastSecondSampled = 0;
  private errorsThisSecond = 0;
  private correctCharsThisSecond = 0;
  private keyStats = new Map<string, InternalKeyStats>();
  private completedResult: EngineResult | null = null;

  private readonly MAX_EXTRA_CHARS = 10;

  constructor(wordStrings: string[], config: EngineConfig) {
    this.config = {
      durationSeconds: config.durationSeconds || 60,
      mode: config.mode || 'words',
      backspaceMode: config.backspaceMode || 'standard',
      confidenceMode: config.confidenceMode || false,
    };
    this.initWords(wordStrings);
  }

  private recordKeyAttempt(targetKey: string, isCorrect: boolean, latencyMs?: number): void {
    const normalized = targetKey.length === 1 && targetKey >= 'A' && targetKey <= 'Z'
      ? targetKey.toLowerCase()
      : targetKey;

    const current = this.keyStats.get(normalized) || {
      attempts: 0,
      correct: 0,
      errors: 0,
      corrected: 0,
      totalLatencyMs: 0,
      latencyCount: 0,
    };

    current.attempts++;
    if (isCorrect) {
      current.correct++;
    } else {
      current.errors++;
    }

    if (typeof latencyMs === 'number' && latencyMs >= 20 && latencyMs <= 2000) {
      current.totalLatencyMs += latencyMs;
      current.latencyCount++;
    }

    this.keyStats.set(normalized, current);
  }

  public resetKeystrokeTimer(): void {
    this.lastKeystrokeTime = 0;
  }

  private recordKeyCorrection(targetKey: string): void {
    const normalized = targetKey.length === 1 && targetKey >= 'A' && targetKey <= 'Z'
      ? targetKey.toLowerCase()
      : targetKey;

    const current = this.keyStats.get(normalized);
    if (current) {
      current.corrected++;
    }
  }

  private initWords(wordStrings: string[]): void {
    this.words = wordStrings.map((w, idx) => ({
      id: `w-${idx}`,
      originalText: w,
      chars: w.split('').map((c) => ({
        char: c,
        state: 'untouched',
      })),
      isCompleted: false,
      hasError: false,
    }));
  }

  public getStatus(): EngineStatus {
    return this.status;
  }

  public getState(): TypingEngineState {
    const elapsed = this.elapsedSeconds;
    const remaining = Math.max(0, this.config.durationSeconds - elapsed);
    const correctChars = this.getCorrectCharactersCount();
    const totalChars = this.getTotalInputCharactersCount();

    const grossWpm = calculateGrossWpm(totalChars, elapsed);
    const netWpm = calculateNetWpm(correctChars, elapsed);
    const accuracyPct = calculateAccuracy(this.correctKeystrokes, this.totalKeystrokes);

    return {
      status: this.status,
      words: this.words,
      activeWordIndex: this.activeWordIndex,
      activeCharIndex: this.activeCharIndex,
      elapsedSeconds: elapsed,
      remainingSeconds: remaining,
      durationSeconds: this.config.durationSeconds,
      grossWpm,
      netWpm,
      accuracyPct,
      totalKeystrokes: this.totalKeystrokes,
      correctKeystrokes: this.correctKeystrokes,
      errorCount: this.errorCount,
      completedWordsCount: this.completedWordsCount,
    };
  }

  public start(): void {
    if (this.status === 'idle') {
      this.status = 'running';
      this.lastKeystrokeTime = Date.now();
    }
  }

  public handleKeypress(key: string, nowMs = Date.now()): void {
    if (this.status === 'completed') return;

    if (this.status === 'idle') {
      this.start();
    }

    if (this.status !== 'running') return;

    // Track Inter-Keystroke Interval (IKI)
    let delta = 0;
    if (this.lastKeystrokeTime > 0) {
      delta = nowMs - this.lastKeystrokeTime;
      // Filter out pause outliers (> 2000ms) and sub-20ms jitter to preserve timing fidelity
      if (delta >= 20 && delta <= 2000) {
        this.ikis.push(delta);
      } else {
        delta = 0;
      }
    }
    this.lastKeystrokeTime = nowMs;

    const currentWord = this.words[this.activeWordIndex];
    if (!currentWord) return;

    // Handle Spacebar (Word Submission)
    if (key === ' ') {
      this.totalKeystrokes++;
      
      // If user struck spacebar without typing any characters in the word, ignore
      if (this.activeCharIndex === 0) {
        return;
      }

      const hasReachedEnd = this.activeCharIndex >= currentWord.originalText.length;
      const isSpaceCorrect = hasReachedEnd && !currentWord.hasError;
      this.recordKeyAttempt(' ', isSpaceCorrect, delta);

      if (isSpaceCorrect) {
        this.correctKeystrokes++;
        this.correctCharsThisSecond++;
      } else {
        // Mark remaining untouched characters in current word as 'missed'
        for (let i = this.activeCharIndex; i < currentWord.originalText.length; i++) {
          currentWord.chars[i].state = 'missed';
          currentWord.hasError = true;
          this.errorCount++;
          this.errorsThisSecond++;
          this.recordKeyAttempt(currentWord.chars[i].char, false);
        }
      }

      currentWord.isCompleted = true;
      this.completedWordsCount++;
      this.activeWordIndex++;
      this.activeCharIndex = 0;

      // Check if all words completed
      if (this.activeWordIndex >= this.words.length) {
        this.completeTest();
      }
      return;
    }

    // Single character input
    if (key.length === 1) {
      this.totalKeystrokes++;
      const targetLength = currentWord.originalText.length;

      if (this.activeCharIndex < targetLength) {
        // Typing standard character within word bounds
        const targetChar = currentWord.chars[this.activeCharIndex];
        targetChar.inputChar = key;
        const isMatch = (key === targetChar.char);

        this.recordKeyAttempt(targetChar.char, isMatch, delta);

        if (isMatch) {
          targetChar.state = 'correct';
          this.correctKeystrokes++;
          this.correctCharsThisSecond++;
          currentWord.hasError = currentWord.chars.some((c) => c.state === 'incorrect' || c.state === 'extra' || c.state === 'missed');
        } else {
          targetChar.state = 'incorrect';
          currentWord.hasError = true;
          this.errorCount++;
          this.errorsThisSecond++;
        }
        this.activeCharIndex++;

        // Auto-complete if final character of final word typed correctly without error
        if (
          this.activeWordIndex === this.words.length - 1 &&
          this.activeCharIndex === targetLength &&
          !currentWord.hasError
        ) {
          currentWord.isCompleted = true;
          this.completedWordsCount++;
          this.completeTest();
        }
      } else {
        // Typing extra characters beyond word boundary
        const extraCount = currentWord.chars.length - targetLength;
        if (extraCount < this.MAX_EXTRA_CHARS) {
          currentWord.chars.push({
            char: key,
            state: 'extra',
            inputChar: key,
          });
          currentWord.hasError = true;
          this.errorCount++;
          this.errorsThisSecond++;
          this.activeCharIndex++;
          this.recordKeyAttempt(key, false, delta);
        }
      }
    }
  }

  public handleBackspace(isWordDelete = false): void {
    if (this.status !== 'running') return;
    if (this.config.confidenceMode) return; // Confidence mode blocks backspace

    const currentWord = this.words[this.activeWordIndex];
    if (!currentWord) return;

    if (isWordDelete) {
      // Clear all typed chars in active word
      const targetLength = currentWord.originalText.length;
      for (const c of currentWord.chars) {
        if (c.state === 'incorrect' || c.state === 'extra') {
          this.recordKeyCorrection(c.char);
        }
      }
      currentWord.chars = currentWord.chars.slice(0, targetLength).map((c) => ({
        char: c.char,
        state: 'untouched',
      }));
      currentWord.hasError = false;
      this.activeCharIndex = 0;
      return;
    }

    // Standard single backspace
    if (this.activeCharIndex > 0) {
      this.activeCharIndex--;
      const targetLength = currentWord.originalText.length;

      if (this.activeCharIndex >= targetLength) {
        // Remove extra character
        const removed = currentWord.chars.pop();
        if (removed) {
          this.recordKeyCorrection(removed.char);
        }
      } else {
        // Reset normal character back to untouched
        const currentChar = currentWord.chars[this.activeCharIndex];
        if (currentChar.state === 'incorrect' || currentChar.state === 'extra') {
          this.recordKeyCorrection(currentChar.char);
        }
        currentChar.state = 'untouched';
        currentChar.inputChar = undefined;
      }
      currentWord.hasError = currentWord.chars.some((c) => c.state === 'incorrect' || c.state === 'extra' || c.state === 'missed');
    } else if (this.activeCharIndex === 0 && this.activeWordIndex > 0) {
      // Allow backspacing to previous word if it contained errors
      const prevWord = this.words[this.activeWordIndex - 1];
      if (prevWord && prevWord.hasError) {
        this.activeWordIndex--;
        prevWord.isCompleted = false;
        this.completedWordsCount = Math.max(0, this.completedWordsCount - 1);
        this.activeCharIndex = prevWord.chars.length;
      }
    }
  }

  public tickTimer(elapsedSeconds: number): void {
    if (this.status !== 'running') return;

    this.elapsedSeconds = elapsedSeconds;

    // Per-second time-series snapshot
    const wholeSecond = Math.floor(elapsedSeconds);
    if (wholeSecond > this.lastSecondSampled) {
      const rollingWpm = calculateGrossWpm(this.correctCharsThisSecond, 1);
      const cumNetWpm = calculateNetWpm(this.getCorrectCharactersCount(), elapsedSeconds);
      const cumGrossWpm = calculateGrossWpm(this.getTotalInputCharactersCount(), elapsedSeconds);

      this.timeSeries.push({
        second: wholeSecond,
        rollingWpm,
        cumulativeNetWpm: cumNetWpm,
        cumulativeGrossWpm: cumGrossWpm,
        errorsThisSecond: this.errorsThisSecond,
      });

      this.lastSecondSampled = wholeSecond;
      this.errorsThisSecond = 0;
      this.correctCharsThisSecond = 0;
    }

    // Test completion check
    if (this.elapsedSeconds >= this.config.durationSeconds) {
      this.completeTest();
    }
  }

  public completeTest(): EngineResult {
    this.status = 'completed';

    const duration = this.config.durationSeconds;
    const elapsed = Math.max(1, this.elapsedSeconds);
    const correctChars = this.getCorrectCharactersCount();
    const totalInputChars = this.getTotalInputCharactersCount();
    const uncorrected = this.getUncorrectedErrorsCount();

    const grossWpm = calculateGrossWpm(totalInputChars, elapsed);
    const netWpm = calculateNetWpm(correctChars, elapsed);
    const penalizedWpm = calculatePenalizedWpm(correctChars, uncorrected, elapsed);
    const accuracyPct = calculateAccuracy(this.correctKeystrokes, this.totalKeystrokes);
    const consistencyPct = calculateConsistency(this.ikis);

    const perKeyMetrics: Record<string, KeyMetricAggregate> = {};
    for (const [k, s] of this.keyStats.entries()) {
      const acc = s.attempts > 0 ? Number(((s.correct / s.attempts) * 100).toFixed(1)) : 100;
      const avgLat = s.latencyCount > 0 ? Math.round(s.totalLatencyMs / s.latencyCount) : 0;
      let sampleConfidence: ConfidenceLevel = 'insufficient';
      if (s.attempts >= 30) sampleConfidence = 'high';
      else if (s.attempts >= 15) sampleConfidence = 'moderate';
      else if (s.attempts >= 5) sampleConfidence = 'low';

      perKeyMetrics[k] = {
        key: k,
        totalAttempts: s.attempts,
        correctCount: s.correct,
        errorCount: s.errors,
        correctedCount: s.corrected,
        accuracyPct: acc,
        averageLatencyMs: avgLat,
        sampleConfidence,
        lastPracticed: new Date().toISOString(),
      };
    }

    this.completedResult = {
      durationSeconds: duration,
      elapsedSeconds: Number(elapsed.toFixed(1)),
      grossWpm,
      netWpm,
      penalizedWpm,
      accuracyPct,
      consistencyPct,
      totalKeystrokes: this.totalKeystrokes,
      correctKeystrokes: this.correctKeystrokes,
      errorCount: this.errorCount,
      uncorrectedErrors: uncorrected,
      completedWordsCount: this.completedWordsCount,
      timeSeries: this.timeSeries,
      rawIkiArray: this.ikis,
      perKeyMetrics,
      completedAt: new Date().toISOString(),
    };

    return this.completedResult;
  }

  public getResult(): EngineResult | null {
    return this.completedResult;
  }

  /**
   * Replays the exact current set of words without re-randomizing (Undo / Reset).
   */
  public replayCurrentWords(): void {
    this.status = 'idle';
    this.activeWordIndex = 0;
    this.activeCharIndex = 0;
    this.elapsedSeconds = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorCount = 0;
    this.completedWordsCount = 0;
    this.lastKeystrokeTime = 0;
    this.ikis = [];
    this.timeSeries = [];
    this.lastSecondSampled = 0;
    this.errorsThisSecond = 0;
    this.correctCharsThisSecond = 0;
    this.keyStats.clear();
    this.completedResult = null;

    for (const w of this.words) {
      w.isCompleted = false;
      w.hasError = false;
      w.chars = w.originalText.split('').map((c) => ({
        char: c,
        state: 'untouched',
      }));
    }
  }

  /**
   * Returns list of original words in current engine session.
   */
  public getOriginalWords(): string[] {
    return this.words.map((w) => w.originalText);
  }

  private getCorrectCharactersCount(): number {
    let count = 0;
    for (let w = 0; w <= this.activeWordIndex && w < this.words.length; w++) {
      const word = this.words[w];
      for (const c of word.chars) {
        if (c.state === 'correct') {
          count++;
        }
      }
      // Add standard space character if word was successfully completed
      if (word.isCompleted && !word.hasError) {
        count++;
      }
    }
    return count;
  }

  private getTotalInputCharactersCount(): number {
    let count = 0;
    for (let w = 0; w <= this.activeWordIndex && w < this.words.length; w++) {
      const word = this.words[w];
      for (const c of word.chars) {
        if (c.state === 'correct' || c.state === 'incorrect' || c.state === 'extra') {
          count++;
        }
      }
      if (word.isCompleted) {
        count++; // Count space
      }
    }
    return count;
  }

  private getUncorrectedErrorsCount(): number {
    let uncorrected = 0;
    for (let w = 0; w < this.words.length; w++) {
      const word = this.words[w];
      if (word.isCompleted || w === this.activeWordIndex) {
        for (const c of word.chars) {
          if (c.state === 'incorrect' || c.state === 'extra' || c.state === 'missed') {
            uncorrected++;
          }
        }
      }
    }
    return uncorrected;
  }
}
