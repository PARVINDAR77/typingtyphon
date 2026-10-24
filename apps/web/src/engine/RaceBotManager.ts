import { Racer, RaceEngine } from './RaceEngine';

export interface BotState {
  racer: Racer;
  baseWpm: number;
  jitterOffset: number;
  errorThreshold: number;
  nextTypoAtChar: number;
}

const BOT_NAME_POOL = [
  { name: 'Purple Galliform', initials: 'PG', color: '#a855f7', vehicle: '#eab308' },
  { name: 'Ultimate Flea', initials: 'UF', color: '#06b6d4', vehicle: '#10b981' },
  { name: 'Disturbed Rattler', initials: 'DR', color: '#ec4899', vehicle: '#94a3b8' },
  { name: 'Neat Leech', initials: 'NL', color: '#f59e0b', vehicle: '#f43f5e' },
  { name: 'Cyber Lynx', initials: 'CL', color: '#38bdf8', vehicle: '#06b6d4' },
  { name: 'Solar Cheetah', initials: 'SC', color: '#eab308', vehicle: '#f97316' },
  { name: 'Phantom Falcon', initials: 'PF', color: '#8b5cf6', vehicle: '#3b82f6' },
  { name: 'Apex Cobra', initials: 'AC', color: '#10b981', vehicle: '#84cc16' },
];

export class RaceBotManager {
  private bots: BotState[] = [];
  private passageLength: number;

  constructor(passageLength: number, userTargetWpm: number = 50) {
    this.passageLength = passageLength;

    // Shuffle pool to pick 3 random distinct bots
    const shuffled = [...BOT_NAME_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Pick 3 tier speeds around the user's estimated pace for exciting, neck-and-neck races:
    // Bot 1: ~user - 12 WPM (Challenger)
    // Bot 2: ~user + 4 WPM (Close Rival)
    // Bot 3: ~user + 14 WPM (Fast Pacer)
    const baseWpms = [
      Math.max(28, Math.round(userTargetWpm * 0.85 + (Math.random() * 6 - 3))),
      Math.max(34, Math.round(userTargetWpm * 1.05 + (Math.random() * 8 - 4))),
      Math.max(40, Math.round(userTargetWpm * 1.22 + (Math.random() * 10 - 5))),
    ];

    this.bots = selected.map((b, idx) => {
      const targetWpm = baseWpms[idx];
      return {
        racer: {
          id: `bot-${idx + 1}-${Date.now()}`,
          name: b.name,
          avatarInitials: b.initials,
          avatarColor: b.color,
          vehicleColor: b.vehicle,
          isUser: false,
          progressPct: 0,
          currentCharIndex: 0,
          wpm: 0,
          rawWpm: 0,
          accuracyPct: 100,
          errorCount: 0,
          rank: idx + 2,
          isFinished: false,
          targetWpm,
        },
        baseWpm: targetWpm,
        jitterOffset: (Math.random() - 0.5) * 5,
        errorThreshold: Math.floor(Math.random() * 3),
        nextTypoAtChar: Math.floor(Math.random() * 40) + 20,
      };
    });
  }

  public getBotRacers(): Racer[] {
    return this.bots.map((b) => b.racer);
  }

  public tick(elapsedSec: number, engine: RaceEngine) {
    if (elapsedSec <= 0 || engine.getStatus() !== 'racing') return;

    for (const b of this.bots) {
      if (b.racer.isFinished) continue;

      // Realistic speed curve: slight ramp-up during first 2 seconds
      const warmupFactor = Math.min(1.0, 0.4 + (elapsedSec / 2) * 0.6);
      const effectiveWpm = (b.baseWpm + b.jitterOffset) * warmupFactor;

      // Characters per second = WPM * 5 / 60
      const charsPerSec = (effectiveWpm * 5) / 60;
      const targetChars = Math.floor(charsPerSec * elapsedSec);

      const boundedChars = Math.min(this.passageLength, Math.max(0, targetChars));

      // Calculate simulated errors
      let errors = 0;
      if (boundedChars > b.nextTypoAtChar && b.errorThreshold > 0) {
        errors = Math.min(b.errorThreshold, Math.floor(boundedChars / 40));
      }

      engine.updateBotProgress(b.racer.id, boundedChars, elapsedSec, errors);
    }
  }
}
