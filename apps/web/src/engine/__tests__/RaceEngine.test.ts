import { describe, it, expect } from 'vitest';
import { RaceEngine, Racer } from '../RaceEngine';
import { RaceBotManager } from '../RaceBotManager';

describe('RaceEngine', () => {
  const samplePassage = 'The quick brown fox';
  const initialRacers: Racer[] = [
    {
      id: 'user-1',
      name: 'Test Pilot',
      avatarInitials: 'TP',
      avatarColor: '#38bdf8',
      vehicleColor: '#38bdf8',
      isUser: true,
      progressPct: 0,
      currentCharIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracyPct: 100,
      errorCount: 0,
      rank: 1,
      isFinished: false,
    },
    {
      id: 'bot-1',
      name: 'Rival Bot',
      avatarInitials: 'RB',
      avatarColor: '#ec4899',
      vehicleColor: '#ec4899',
      isUser: false,
      progressPct: 0,
      currentCharIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracyPct: 100,
      errorCount: 0,
      rank: 2,
      isFinished: false,
    },
  ];

  it('initializes with correct character states and racers', () => {
    const engine = new RaceEngine(samplePassage, initialRacers);
    expect(engine.getStatus()).toBe('waiting');
    expect(engine.getPassage()).toBe(samplePassage);
    expect(engine.getCharStates().length).toBe(samplePassage.length);
    expect(engine.getCharStates()[0].state).toBe('untouched');
    expect(engine.getRacers().length).toBe(2);
  });

  it('processes correct keystrokes, calculates progress, and finishes', () => {
    const engine = new RaceEngine(samplePassage, initialRacers);
    engine.startRace(1000);
    expect(engine.getStatus()).toBe('racing');

    // Type first character 'T'
    const res1 = engine.handleKeystroke('T', 1100);
    expect(res1.correct).toBe(true);
    expect(res1.finished).toBe(false);
    expect(engine.getUserIndex()).toBe(1);
    expect(engine.getCharStates()[0].state).toBe('correct');

    const userRacer = engine.getRacers().find((r) => r.isUser);
    expect(userRacer?.progressPct).toBeGreaterThan(0);

    // Type the remaining characters
    for (let i = 1; i < samplePassage.length; i++) {
      engine.handleKeystroke(samplePassage[i], 1100 + i * 100);
    }

    expect(engine.isUserFinished()).toBe(true);
    expect(userRacer?.progressPct).toBe(100);
    expect(userRacer?.finishTimeSec).toBeDefined();
  });

  it('tracks incorrect keystrokes and allows backspace correction', () => {
    const engine = new RaceEngine(samplePassage, initialRacers);
    engine.startRace(1000);

    // Wrong keystroke
    const res = engine.handleKeystroke('Z', 1100);
    expect(res.correct).toBe(false);
    expect(engine.getCharStates()[0].state).toBe('incorrect');

    // Backspace
    engine.handleBackspace();
    expect(engine.getCharStates()[0].state).toBe('untouched');

    // Correct keystroke
    const resCorrect = engine.handleKeystroke('T', 1200);
    expect(resCorrect.correct).toBe(true);
    expect(engine.getCharStates()[0].state).toBe('correct');
  });

  it('updates bot progress and adjusts dynamic rankings', () => {
    const engine = new RaceEngine(samplePassage, initialRacers);
    engine.startRace(1000);

    // User types 2 chars
    engine.handleKeystroke('T', 1100);
    engine.handleKeystroke('h', 1200);

    // Bot jumps ahead by 10 chars
    engine.updateBotProgress('bot-1', 10, 2);

    const bot = engine.getRacers().find((r) => r.id === 'bot-1');
    const user = engine.getRacers().find((r) => r.isUser);

    expect(bot?.rank).toBe(1);
    expect(user?.rank).toBe(2);
  });
});

describe('RaceBotManager', () => {
  it('creates 3 diverse bot racers', () => {
    const manager = new RaceBotManager(100, 50);
    const bots = manager.getBotRacers();
    expect(bots.length).toBe(3);
    expect(bots[0].name).toBeDefined();
    expect(bots[0].avatarInitials.length).toBe(2);
    expect(bots[0].isUser).toBe(false);
  });
});
