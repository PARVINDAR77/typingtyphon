export type RaceGameMode = 'supercar' | 'cyberdrift' | 'wordrush';

export interface Racer {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  vehicleColor: string;
  isUser: boolean;
  progressPct: number; // 0.0 - 100.0
  currentCharIndex: number;
  wpm: number;
  rawWpm: number;
  accuracyPct: number;
  errorCount: number;
  rank: number; // 1, 2, 3, 4
  isFinished: boolean;
  finishTimeSec?: number;
  targetWpm?: number;
}

export interface RacePassage {
  id: string;
  text: string;
  source?: string;
  difficulty?: 'normal' | 'hard';
}

export interface RaceCharState {
  char: string;
  state: 'untouched' | 'correct' | 'incorrect';
}

export class RaceEngine {
  private passage: string;
  private charStates: RaceCharState[];
  private userIndex: number = 0;
  private userErrors: number = 0;
  private totalTypedKeys: number = 0;
  private startTime: number | null = null;
  private finishTime: number | null = null;
  private racers: Racer[] = [];
  private status: 'waiting' | 'countdown' | 'racing' | 'finished' = 'waiting';

  constructor(passage: string, initialRacers: Racer[]) {
    this.passage = passage;
    this.charStates = passage.split('').map((char) => ({
      char,
      state: 'untouched',
    }));
    this.racers = initialRacers.map((r, i) => ({
      ...r,
      progressPct: 0,
      currentCharIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracyPct: 100,
      errorCount: 0,
      rank: i + 1,
      isFinished: false,
    }));
  }

  public getStatus() {
    return this.status;
  }

  public setStatus(newStatus: 'waiting' | 'countdown' | 'racing' | 'finished') {
    this.status = newStatus;
  }

  public startRace(now: number = performance.now()) {
    this.status = 'racing';
    this.startTime = now;
  }

  public handleKeystroke(key: string, now: number = performance.now()): {
    correct: boolean;
    finished: boolean;
  } {
    if (this.status !== 'racing' || !this.startTime || this.userIndex >= this.passage.length) {
      return { correct: false, finished: this.isUserFinished() };
    }

    this.totalTypedKeys++;
    const targetChar = this.passage[this.userIndex];

    if (key === targetChar) {
      this.charStates[this.userIndex].state = 'correct';
      this.userIndex++;
    } else {
      this.charStates[this.userIndex].state = 'incorrect';
      this.userErrors++;
    }

    const elapsedMin = Math.max((now - this.startTime) / 60000, 0.005);
    const correctChars = this.userIndex;
    const netWpm = Math.max(0, Math.round(correctChars / 5 / elapsedMin));
    const rawWpm = Math.max(0, Math.round(this.totalTypedKeys / 5 / elapsedMin));
    const accuracyPct = this.totalTypedKeys > 0 ? Math.round(((this.totalTypedKeys - this.userErrors) / this.totalTypedKeys) * 100) : 100;
    const progressPct = Math.min(100, Math.round((this.userIndex / this.passage.length) * 1000) / 10);

    const userRacer = this.racers.find((r) => r.isUser);
    if (userRacer) {
      userRacer.currentCharIndex = this.userIndex;
      userRacer.progressPct = progressPct;
      userRacer.wpm = netWpm;
      userRacer.rawWpm = rawWpm;
      userRacer.accuracyPct = accuracyPct;
      userRacer.errorCount = this.userErrors;

      if (this.userIndex >= this.passage.length && !userRacer.isFinished) {
        userRacer.isFinished = true;
        userRacer.progressPct = 100;
        this.finishTime = now;
        userRacer.finishTimeSec = Math.round(((now - this.startTime) / 1000) * 100) / 100;
      }
    }

    this.updateRankings();

    const allFinished = this.racers.every((r) => r.isFinished);
    if (allFinished || (userRacer && userRacer.isFinished && this.racers.filter((r) => !r.isFinished).length === 0)) {
      this.status = 'finished';
    }

    return {
      correct: key === targetChar,
      finished: this.isUserFinished(),
    };
  }

  public handleBackspace() {
    if (this.status !== 'racing') return;

    // If current character has an error, allow removing the error on current index
    if (this.charStates[this.userIndex]?.state === 'incorrect') {
      this.charStates[this.userIndex].state = 'untouched';
      return;
    }

    if (this.userIndex <= 0) return;

    // Step back one character
    this.userIndex = Math.max(0, this.userIndex - 1);
    this.charStates[this.userIndex].state = 'untouched';

    const userRacer = this.racers.find((r) => r.isUser);
    if (userRacer) {
      userRacer.currentCharIndex = this.userIndex;
      userRacer.progressPct = Math.min(100, Math.round((this.userIndex / this.passage.length) * 1000) / 10);
    }
    this.updateRankings();
  }

  public updateBotProgress(botId: string, charIndex: number, elapsedSec: number, errors: number = 0) {
    const bot = this.racers.find((r) => r.id === botId);
    if (!bot || bot.isFinished || this.status !== 'racing') return;

    bot.currentCharIndex = Math.min(this.passage.length, charIndex);
    bot.progressPct = Math.min(100, Math.round((bot.currentCharIndex / this.passage.length) * 1000) / 10);
    bot.errorCount = errors;

    const elapsedMin = Math.max(elapsedSec / 60, 0.005);
    bot.wpm = Math.max(0, Math.round(bot.currentCharIndex / 5 / elapsedMin));
    bot.rawWpm = bot.wpm;
    bot.accuracyPct = Math.max(88, 100 - Math.round((errors / Math.max(1, bot.currentCharIndex)) * 100));

    if (bot.currentCharIndex >= this.passage.length && !bot.isFinished) {
      bot.isFinished = true;
      bot.progressPct = 100;
      bot.finishTimeSec = Math.round(elapsedSec * 100) / 100;
    }

    this.updateRankings();
  }

  public updateRankings() {
    // Sort racers: Finished racers first (ordered by finishTimeSec asc), then active racers by progressPct desc, then wpm desc
    const sorted = [...this.racers].sort((a, b) => {
      if (a.isFinished && b.isFinished) {
        return (a.finishTimeSec || 9999) - (b.finishTimeSec || 9999);
      }
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      if (b.progressPct !== a.progressPct) {
        return b.progressPct - a.progressPct;
      }
      return b.wpm - a.wpm;
    });

    sorted.forEach((racer, idx) => {
      const target = this.racers.find((r) => r.id === racer.id);
      if (target) {
        target.rank = idx + 1;
      }
    });
  }

  public isUserFinished(): boolean {
    const user = this.racers.find((r) => r.isUser);
    return !!user?.isFinished;
  }

  public getRacers(): Racer[] {
    return this.racers;
  }

  public getUserIndex(): number {
    return this.userIndex;
  }

  public getCharStates(): RaceCharState[] {
    return this.charStates;
  }

  public getPassage(): string {
    return this.passage;
  }

  public getFinishOrder(): Racer[] {
    return [...this.racers].sort((a, b) => a.rank - b.rank);
  }
}
