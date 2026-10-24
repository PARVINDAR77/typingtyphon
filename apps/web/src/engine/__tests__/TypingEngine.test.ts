import { describe, it, expect, beforeEach } from 'vitest';
import { TypingEngine } from '../TypingEngine';

describe('TypingEngine Unit Tests', () => {
  const sampleWords = ['the', 'quick', 'brown', 'fox'];
  let engine: TypingEngine;

  beforeEach(() => {
    engine = new TypingEngine(sampleWords, {
      durationSeconds: 60,
      mode: 'words',
      backspaceMode: 'standard',
    });
  });

  it('should initialize with idle state and 0 keystrokes without NaN', () => {
    const state = engine.getState();
    expect(state.status).toBe('idle');
    expect(state.grossWpm).toBe(0);
    expect(state.netWpm).toBe(0);
    expect(state.accuracyPct).toBe(100);
    expect(state.totalKeystrokes).toBe(0);
    expect(state.correctKeystrokes).toBe(0);
    expect(state.errorCount).toBe(0);
    expect(state.activeWordIndex).toBe(0);
    expect(state.activeCharIndex).toBe(0);
    expect(state.remainingSeconds).toBe(60);
  });

  it('should start automatically on first valid character keypress', () => {
    engine.handleKeypress('t');
    const state = engine.getState();
    expect(state.status).toBe('running');
    expect(state.totalKeystrokes).toBe(1);
    expect(state.correctKeystrokes).toBe(1);
    expect(state.errorCount).toBe(0);
    expect(state.accuracyPct).toBe(100);
    expect(state.words[0].chars[0].state).toBe('correct');
    expect(state.activeCharIndex).toBe(1);
  });

  it('should correctly handle and flag incorrect keystrokes', () => {
    engine.handleKeypress('x'); // target is 't'
    const state = engine.getState();
    expect(state.status).toBe('running');
    expect(state.totalKeystrokes).toBe(1);
    expect(state.correctKeystrokes).toBe(0);
    expect(state.errorCount).toBe(1);
    expect(state.accuracyPct).toBe(0);
    expect(state.words[0].chars[0].state).toBe('incorrect');
    expect(state.words[0].hasError).toBe(true);
    expect(state.activeCharIndex).toBe(1);
  });

  it('should handle spacebar to advance words', () => {
    // Type "the "
    engine.handleKeypress('t');
    engine.handleKeypress('h');
    engine.handleKeypress('e');
    engine.handleKeypress(' ');

    const state = engine.getState();
    expect(state.activeWordIndex).toBe(1);
    expect(state.activeCharIndex).toBe(0);
    expect(state.completedWordsCount).toBe(1);
    expect(state.words[0].isCompleted).toBe(true);
    expect(state.words[0].hasError).toBe(false);
  });

  it('should mark uncompleted characters as missed when space is pressed prematurely', () => {
    // Type "t " on word "the"
    engine.handleKeypress('t');
    engine.handleKeypress(' ');

    const state = engine.getState();
    expect(state.activeWordIndex).toBe(1);
    expect(state.words[0].chars[0].state).toBe('correct');
    expect(state.words[0].chars[1].state).toBe('missed');
    expect(state.words[0].chars[2].state).toBe('missed');
    expect(state.words[0].hasError).toBe(true);
    expect(state.errorCount).toBe(2);
  });

  it('should support backspace to undo character input', () => {
    engine.handleKeypress('t');
    engine.handleKeypress('x'); // incorrect 'h'
    expect(engine.getState().activeCharIndex).toBe(2);
    expect(engine.getState().words[0].chars[1].state).toBe('incorrect');

    engine.handleBackspace();
    expect(engine.getState().activeCharIndex).toBe(1);
    expect(engine.getState().words[0].chars[1].state).toBe('untouched');

    engine.handleKeypress('h'); // corrected
    expect(engine.getState().words[0].chars[1].state).toBe('correct');
  });

  it('should support word delete (Ctrl+Backspace) to clear active word', () => {
    engine.handleKeypress('t');
    engine.handleKeypress('x');
    engine.handleBackspace(true); // word delete

    const state = engine.getState();
    expect(state.activeCharIndex).toBe(0);
    expect(state.words[0].chars[0].state).toBe('untouched');
    expect(state.words[0].chars[1].state).toBe('untouched');
  });

  it('should terminate the test and compute accurate results when timer expires', () => {
    // Type "the " in 15 seconds
    engine.handleKeypress('t');
    engine.handleKeypress('h');
    engine.handleKeypress('e');
    engine.handleKeypress(' ');

    // Fast forward timer to 60s
    engine.tickTimer(60);

    expect(engine.getStatus()).toBe('completed');
    const result = engine.getResult();
    expect(result).not.toBeNull();
    if (result) {
      expect(result.durationSeconds).toBe(60);
      expect(result.totalKeystrokes).toBe(4);
      expect(result.correctKeystrokes).toBe(4);
      expect(result.accuracyPct).toBe(100); // 4 correct out of 4 total keystrokes (t, h, e, space)
      expect(result.netWpm).toBeGreaterThan(0);
      expect(result.completedWordsCount).toBe(1);
    }
  });

  it('should prevent input after test completion', () => {
    engine.start();
    engine.tickTimer(60);
    expect(engine.getStatus()).toBe('completed');
    const keystrokesBefore = engine.getState().totalKeystrokes;

    engine.handleKeypress('a');
    expect(engine.getState().totalKeystrokes).toBe(keystrokesBefore);
  });

  it('should accurately handle punctuation, symbols, and apostrophes', () => {
    const punctEngine = new TypingEngine(['hello,', 'world!', "don't"], {
      durationSeconds: 30,
      mode: 'sentences',
    });

    // Type "hello,"
    ['h', 'e', 'l', 'l', 'o', ','].forEach((char) => punctEngine.handleKeypress(char));
    expect(punctEngine.getState().words[0].chars[5].char).toBe(',');
    expect(punctEngine.getState().words[0].chars[5].state).toBe('correct');
    expect(punctEngine.getState().words[0].hasError).toBe(false);
    punctEngine.handleKeypress(' ');

    // Type "world!"
    ['w', 'o', 'r', 'l', 'd', '!'].forEach((char) => punctEngine.handleKeypress(char));
    expect(punctEngine.getState().words[1].chars[5].char).toBe('!');
    expect(punctEngine.getState().words[1].chars[5].state).toBe('correct');
    punctEngine.handleKeypress(' ');

    // Type "don't"
    ['d', 'o', 'n', "'", 't'].forEach((char) => punctEngine.handleKeypress(char));
    expect(punctEngine.getState().words[2].chars[3].char).toBe("'");
    expect(punctEngine.getState().words[2].chars[3].state).toBe('correct');
    expect(punctEngine.getState().accuracyPct).toBe(100);
  });

  it('should accurately handle words with repeated consecutive characters', () => {
    const repeatEngine = new TypingEngine(['balloon', 'success'], {
      durationSeconds: 30,
      mode: 'words',
    });

    ['b', 'a', 'l', 'l', 'o', 'o', 'n'].forEach((c) => repeatEngine.handleKeypress(c));
    const word0 = repeatEngine.getState().words[0];
    expect(word0.chars[2].char).toBe('l');
    expect(word0.chars[2].state).toBe('correct');
    expect(word0.chars[3].char).toBe('l');
    expect(word0.chars[3].state).toBe('correct');
    expect(word0.chars[4].char).toBe('o');
    expect(word0.chars[5].char).toBe('o');
    expect(word0.hasError).toBe(false);
  });

  it('should clamp extra characters typed beyond word length to MAX_EXTRA_CHARS (10)', () => {
    // Word is "the" (length 3). Type 15 characters
    ['t', 'h', 'e', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'].forEach((c) =>
      engine.handleKeypress(c)
    );

    const word0 = engine.getState().words[0];
    // Original 3 + 10 extra = 13 max chars
    expect(word0.chars.length).toBe(13);
    const extraChars = word0.chars.filter((c) => c.state === 'extra');
    expect(extraChars.length).toBe(10);
  });

  it('should prevent backspacing in confidenceMode', () => {
    const confEngine = new TypingEngine(['test', 'word'], {
      durationSeconds: 30,
      mode: 'words',
      confidenceMode: true,
    });

    confEngine.handleKeypress('t');
    confEngine.handleKeypress('e');
    expect(confEngine.getState().activeCharIndex).toBe(2);

    confEngine.handleBackspace();
    // In confidence mode, activeCharIndex remains at 2 (backspace blocked)
    expect(confEngine.getState().activeCharIndex).toBe(2);
  });

  it('should support cross-word backspacing when previous word contained an error', () => {
    // Type "tx " (word 0 has error: 't', 'x', ' ')
    engine.handleKeypress('t');
    engine.handleKeypress('x'); // error
    engine.handleKeypress(' '); // advances to word 1

    expect(engine.getState().activeWordIndex).toBe(1);
    expect(engine.getState().activeCharIndex).toBe(0);

    // Backspace from start of word 1 should navigate back into word 0
    engine.handleBackspace();
    expect(engine.getState().activeWordIndex).toBe(0);
    expect(engine.getState().activeCharIndex).toBe(3); // position at end of word 0
  });

  it('should correctly calculate penalized WPM when uncorrected errors remain', () => {
    // Type "thx " on word "the"
    engine.handleKeypress('t');
    engine.handleKeypress('h');
    engine.handleKeypress('x'); // 1 error
    engine.handleKeypress(' ');

    engine.tickTimer(60); // 1 minute elapsed
    const result = engine.getResult();
    expect(result).not.toBeNull();
    if (result) {
      expect(result.uncorrectedErrors).toBe(1);
      // Net WPM > Penalized WPM because of deduction
      expect(result.penalizedWpm).toBeLessThanOrEqual(result.netWpm);
    }
  });

  it('should handle incomplete tests where user types only 1 word of 100 before timer ends', () => {
    engine.handleKeypress('t');
    engine.handleKeypress('h');
    engine.handleKeypress('e');
    engine.handleKeypress(' ');

    // User stops typing, timer reaches 60s
    engine.tickTimer(60);

    const result = engine.getResult();
    expect(result).not.toBeNull();
    if (result) {
      expect(result.completedWordsCount).toBe(1);
      expect(result.netWpm).toBeGreaterThan(0);
      expect(result.accuracyPct).toBe(100);
      // Subsequent unreached words are not counted as errors
      expect(result.uncorrectedErrors).toBe(0);
    }
  });

  it('should auto-complete test when final character of final word in drill is typed correctly', () => {
    const drillEngine = new TypingEngine(['fff', 'jjj'], {
      durationSeconds: 30,
      mode: 'words',
    });

    // Type first word: 'fff' + ' '
    drillEngine.handleKeypress('f');
    drillEngine.handleKeypress('f');
    drillEngine.handleKeypress('f');
    drillEngine.handleKeypress(' ');

    expect(drillEngine.getStatus()).toBe('running');
    expect(drillEngine.getState().activeWordIndex).toBe(1);

    // Type second and final word: 'jjj'
    drillEngine.handleKeypress('j');
    drillEngine.handleKeypress('j');
    drillEngine.handleKeypress('j'); // final character

    expect(drillEngine.getStatus()).toBe('completed');
    const result = drillEngine.getResult();
    expect(result).not.toBeNull();
    if (result) {
      expect(result.completedWordsCount).toBe(2);
      expect(result.accuracyPct).toBe(100);
    }
  });

  it('should accurately handle capitalization and case sensitivity', () => {
    const caseEngine = new TypingEngine(['TypeScript', 'Next.js'], {
      durationSeconds: 30,
      mode: 'words',
    });

    // Lowercase 't' when target is uppercase 'T' must be flagged incorrect
    caseEngine.handleKeypress('t');
    expect(caseEngine.getState().words[0].chars[0].state).toBe('incorrect');

    // Backspace to fix
    caseEngine.handleBackspace();
    expect(caseEngine.getState().words[0].chars[0].state).toBe('untouched');

    // Correct uppercase 'T'
    caseEngine.handleKeypress('T');
    expect(caseEngine.getState().words[0].chars[0].state).toBe('correct');

    // Complete the rest of "TypeScript"
    'ypeScript'.split('').forEach((c) => caseEngine.handleKeypress(c));
    expect(caseEngine.getState().words[0].hasError).toBe(false);
  });

  it('should safely complete when 0 keystrokes are typed and produce 0 NaN or Infinity', () => {
    const idleEngine = new TypingEngine(['zero', 'input'], {
      durationSeconds: 15,
      mode: 'words',
    });

    idleEngine.start();
    idleEngine.tickTimer(15);

    expect(idleEngine.getStatus()).toBe('completed');
    const res = idleEngine.getResult();
    expect(res).not.toBeNull();
    if (res) {
      expect(Number.isNaN(res.netWpm)).toBe(false);
      expect(Number.isNaN(res.grossWpm)).toBe(false);
      expect(Number.isNaN(res.accuracyPct)).toBe(false);
      expect(Number.isNaN(res.consistencyPct)).toBe(false);
      expect(res.netWpm).toBe(0);
      expect(res.grossWpm).toBe(0);
      expect(res.accuracyPct).toBe(100);
      expect(res.totalKeystrokes).toBe(0);
      expect(res.correctKeystrokes).toBe(0);
      expect(res.errorCount).toBe(0);
    }
  });

  it('should verify all 5 distinct character states in word items', () => {
    const stateEngine = new TypingEngine(['cat', 'dog'], {
      durationSeconds: 30,
      mode: 'words',
    });

    // Initial state: all chars 'untouched'
    expect(stateEngine.getState().words[0].chars[0].state).toBe('untouched');

    // 1. Correct: type 'c'
    stateEngine.handleKeypress('c');
    expect(stateEngine.getState().words[0].chars[0].state).toBe('correct');

    // 2. Incorrect: type 'x' instead of 'a'
    stateEngine.handleKeypress('x');
    expect(stateEngine.getState().words[0].chars[1].state).toBe('incorrect');

    // 3. Extra: type beyond target length without space
    stateEngine.handleKeypress('t'); // correct 3rd char
    stateEngine.handleKeypress('z'); // extra
    expect(stateEngine.getState().words[0].chars[3].state).toBe('extra');

    // Advance to next word
    stateEngine.handleKeypress(' ');

    // 4. Missed: skip word 'dog' by typing 'd' and pressing space immediately
    stateEngine.handleKeypress('d');
    stateEngine.handleKeypress(' ');
    expect(stateEngine.getState().words[1].chars[0].state).toBe('correct');
    expect(stateEngine.getState().words[1].chars[1].state).toBe('missed'); // 'o'
    expect(stateEngine.getState().words[1].chars[2].state).toBe('missed'); // 'g'
  });

  describe('Typing Engine Scoring Semantics (Sprint 2.2 Specification)', () => {
    it('distinguishes a typo that remains uncorrected at completion vs corrected with backspace', () => {
      // 1. Uncorrected Typo Engine
      const uncorrectedEng = new TypingEngine(['apple', 'tree'], { durationSeconds: 60, mode: 'words' });
      // Type "appxe" (typo at index 3: 'x' instead of 'l')
      'appxe'.split('').forEach((c) => uncorrectedEng.handleKeypress(c));
      uncorrectedEng.handleKeypress(' '); // Advance to tree
      'tree'.split('').forEach((c) => uncorrectedEng.handleKeypress(c));
      uncorrectedEng.tickTimer(10);
      const uncorrectedRes = uncorrectedEng.completeTest();

      expect(uncorrectedRes.uncorrectedErrors).toBe(1);
      // Net WPM counts all correct characters
      // Penalized WPM deducts 1 standard word per uncorrected error: (netWords - 1) / (10/60)
      expect(uncorrectedRes.penalizedWpm).toBeLessThan(uncorrectedRes.netWpm);

      // 2. Corrected Typo Engine (using backspace)
      const correctedEng = new TypingEngine(['apple', 'tree'], { durationSeconds: 60, mode: 'words' });
      // Type "appx"
      'appx'.split('').forEach((c) => correctedEng.handleKeypress(c));
      // User notices error, hits backspace, and types "le"
      correctedEng.handleBackspace();
      'le'.split('').forEach((c) => correctedEng.handleKeypress(c));
      correctedEng.handleKeypress(' '); // Advance to tree
      'tree'.split('').forEach((c) => correctedEng.handleKeypress(c));
      correctedEng.tickTimer(10);
      const correctedRes = correctedEng.completeTest();

      // Zero uncorrected errors remain
      expect(correctedRes.uncorrectedErrors).toBe(0);
      // With 0 uncorrected errors, penalized WPM equals net WPM
      expect(correctedRes.penalizedWpm).toBe(correctedRes.netWpm);
      // But accuracy was impacted by the mistake ('x')
      expect(correctedRes.errorCount).toBe(1);
      expect(correctedRes.accuracyPct).toBeLessThan(100);
    });

    it('distinguishes an incorrect character followed by a correct character', () => {
      const eng = new TypingEngine(['house'], { durationSeconds: 60, mode: 'words' });
      // Target: 'h', 'o', 'u', 's', 'e'
      // User types: 'h' (correct), 'z' (incorrect), 'u' (correct 3rd char without backspace)
      eng.handleKeypress('h');
      eng.handleKeypress('z');
      eng.handleKeypress('u');

      const state = eng.getState();
      expect(state.words[0].chars[0].state).toBe('correct');
      expect(state.words[0].chars[1].state).toBe('incorrect');
      expect(state.words[0].chars[2].state).toBe('correct');
      expect(state.words[0].chars[3].state).toBe('untouched');
      // Word is flagged as hasError because an incorrect char exists within it
      expect(state.words[0].hasError).toBe(true);
      expect(state.correctKeystrokes).toBe(2);
      expect(state.errorCount).toBe(1);
    });

    it('distinguishes extra characters and skipped characters', () => {
      const eng = new TypingEngine(['cat', 'rabbit'], { durationSeconds: 60, mode: 'words' });
      
      // 1. Extra characters: typing "catsxyz" on "cat"
      'catsxyz'.split('').forEach((c) => eng.handleKeypress(c));
      const word1 = eng.getState().words[0];
      const extraChars = word1.chars.filter((c) => c.state === 'extra');
      expect(extraChars.length).toBe(4); // 's', 'x', 'y', 'z'
      
      // Advance word
      eng.handleKeypress(' ');

      // 2. Skipped characters: typing 'r', 'a' on 'rabbit' and hitting space
      eng.handleKeypress('r');
      eng.handleKeypress('a');
      eng.handleKeypress(' ');
      const word2 = eng.getState().words[1];
      const missedChars = word2.chars.filter((c) => c.state === 'missed');
      expect(missedChars.length).toBe(4); // 'b', 'b', 'i', 't'
    });

    it('distinguishes early completion vs timer expiry in elapsed time and WPM calculation', () => {
      // 1. Early completion: typist completes all text in 12 seconds of a 60-second test
      const earlyEng = new TypingEngine(['quick', 'fox'], { durationSeconds: 60, mode: 'words' });
      earlyEng.start();
      'quick'.split('').forEach((c) => earlyEng.handleKeypress(c));
      earlyEng.handleKeypress(' ');
      earlyEng.tickTimer(12); // 12 seconds elapsed
      'fox'.split('').forEach((c) => earlyEng.handleKeypress(c)); // Final char completes test!

      expect(earlyEng.getStatus()).toBe('completed');
      const earlyRes = earlyEng.getResult()!;
      expect(earlyRes.elapsedSeconds).toBe(12);
      expect(earlyRes.durationSeconds).toBe(60);
      // WPM must be calculated based on 12 seconds (0.2 minutes), NOT 60 seconds (1.0 minute)!
      // 9 characters / 5 = 1.8 words. In 0.2 minutes = 9.0 WPM
      expect(earlyRes.netWpm).toBeGreaterThan(8);

      // 2. Timer expiry: typist finishes after 60 seconds elapsed
      const expiryEng = new TypingEngine(['quick', 'fox'], { durationSeconds: 60, mode: 'words' });
      expiryEng.start();
      'quick'.split('').forEach((c) => expiryEng.handleKeypress(c));
      expiryEng.handleKeypress(' ');
      expiryEng.tickTimer(60); // Timer expires!

      expect(expiryEng.getStatus()).toBe('completed');
      const expiryRes = expiryEng.getResult()!;
      expect(expiryRes.elapsedSeconds).toBe(60);
      expect(expiryRes.durationSeconds).toBe(60);
      // 6 characters ('quick ') / 5 = 1.2 words. In 1.0 minute = 1.2 WPM
      expect(expiryRes.netWpm).toBeCloseTo(1.2, 1);
    });

    it('accurately computes per-key metrics, corrections, and sample size confidence', () => {
      const eng = new TypingEngine(['cat', 'car'], { durationSeconds: 60, mode: 'words' });
      eng.start();

      // Type 'c', 'a'
      eng.handleKeypress('c');
      eng.handleKeypress('a');
      // Typo on 't': type 'x' instead of 't'
      eng.handleKeypress('x');
      // Backspace to correct typo
      eng.handleBackspace();
      // Type correct 't'
      eng.handleKeypress('t');
      // Space
      eng.handleKeypress(' ');

      // Word 2: 'car'
      eng.handleKeypress('c');
      eng.handleKeypress('a');
      eng.handleKeypress('r');

      const res = eng.completeTest();
      expect(res.perKeyMetrics).toBeDefined();

      const metrics = res.perKeyMetrics!;

      // 'c': 2 attempts, 2 correct, 0 errors, 100% accuracy
      expect(metrics['c']).toBeDefined();
      expect(metrics['c'].totalAttempts).toBe(2);
      expect(metrics['c'].correctCount).toBe(2);
      expect(metrics['c'].errorCount).toBe(0);
      expect(metrics['c'].accuracyPct).toBe(100.0);
      // Sample size < 5 must be labeled 'insufficient'
      expect(metrics['c'].sampleConfidence).toBe('insufficient');

      // 't': 2 attempts (1 error 'x', 1 correct 't'), 1 corrected
      expect(metrics['t']).toBeDefined();
      expect(metrics['t'].totalAttempts).toBe(2);
      expect(metrics['t'].errorCount).toBe(1);
      expect(metrics['t'].correctCount).toBe(1);
      expect(metrics['t'].correctedCount).toBe(1);
      expect(metrics['t'].accuracyPct).toBe(50.0);
      expect(metrics['t'].sampleConfidence).toBe('insufficient');
    });

    it('assigns higher confidence levels when key attempt thresholds are satisfied', () => {
      // Create test with 35 'f' keystrokes to verify 'high' confidence threshold
      const words = Array(7).fill('fffff');
      const eng = new TypingEngine(words, { durationSeconds: 60, mode: 'words' });
      eng.start();

      for (let i = 0; i < words.length; i++) {
        for (const char of words[i]) {
          eng.handleKeypress(char);
        }
        if (i < words.length - 1) eng.handleKeypress(' ');
      }

      const res = eng.completeTest();
      const metrics = res.perKeyMetrics!;
      expect(metrics['f'].totalAttempts).toBe(35);
      // >= 30 attempts is 'high' confidence
      expect(metrics['f'].sampleConfidence).toBe('high');
    });

    it('rejects pause outliers (> 2000ms) from skewing key latency averages', () => {
      const eng = new TypingEngine(['cat'], { durationSeconds: 60, mode: 'words' });
      eng.start();

      let t = 1000;
      // First keypress at t=1000
      eng.handleKeypress('c', t);

      // Second keypress at t=1150 (delta = 150ms -> valid)
      t += 150;
      eng.handleKeypress('a', t);

      // Third keypress after a 4000ms reading pause (delta = 4000ms -> outlier, ignored in latency)
      t += 4000;
      eng.handleKeypress('t', t);

      const res = eng.completeTest();
      const metrics = res.perKeyMetrics!;

      // 'a' has average latency of 150ms
      expect(metrics['a'].averageLatencyMs).toBe(150);
      // 't' interval (4000ms) was rejected as an outlier, so its averageLatency is 0 (no valid latency samples)
      expect(metrics['t'].averageLatencyMs).toBe(0);
    });

    it('handles focus loss and timer reset via resetKeystrokeTimer() without corrupting delta', () => {
      const eng = new TypingEngine(['top'], { durationSeconds: 60, mode: 'words' });
      eng.start();

      let t = 2000;
      eng.handleKeypress('t', t);

      // Window loses focus / tab blur occurs for 10 seconds
      eng.resetKeystrokeTimer();

      // Window regains focus at t=12000
      t = 12000;
      eng.handleKeypress('o', t);

      // Next keypress at t=12180 (delta = 180ms -> valid)
      t += 180;
      eng.handleKeypress('p', t);

      const res = eng.completeTest();
      const metrics = res.perKeyMetrics!;

      // 'o' had no valid delta because timer was reset upon blur
      expect(metrics['o'].averageLatencyMs).toBe(0);
      // 'p' had clean 180ms delta
      expect(metrics['p'].averageLatencyMs).toBe(180);
    });

    it('replayCurrentWords resets status, caret, and untouched states while preserving identical words', () => {
      const eng = new TypingEngine(['react', 'next'], { durationSeconds: 60, mode: 'words' });
      eng.handleKeypress('r');
      eng.handleKeypress('x'); // error
      expect(eng.getState().status).toBe('running');
      expect(eng.getState().totalKeystrokes).toBe(2);
      expect(eng.getState().errorCount).toBe(1);

      eng.replayCurrentWords();

      const resetState = eng.getState();
      expect(resetState.status).toBe('idle');
      expect(resetState.totalKeystrokes).toBe(0);
      expect(resetState.errorCount).toBe(0);
      expect(resetState.activeWordIndex).toBe(0);
      expect(resetState.activeCharIndex).toBe(0);
      expect(eng.getOriginalWords()).toEqual(['react', 'next']);
      expect(resetState.words[0].chars.every((c) => c.state === 'untouched')).toBe(true);
    });
  });
});


