// 1. Reemplazo para Zone
export const Zone = {
  EARTH: 'earth',
  MOON: 'moon',
  MARS: 'mars',
  JUPITER: 'jupiter',
} as const;
export type Zone = typeof Zone[keyof typeof Zone];

// 2. Reemplazo para ItemType
export const ItemType = {
  STAR: 'star',
  DEBRIS: 'debris',
} as const;
export type ItemType = typeof ItemType[keyof typeof ItemType];

// 3. Reemplazo para TrialOutcome
export const TrialOutcome = {
  HIT: 'hit',
  MISS: 'miss',
  CORRECT_REJECTION: 'correct_rejection',
  COMMISSION_ERROR: 'commission_error',
  SHIELD_HIT: 'shield_hit',
  SHIELD_MISS: 'shield_miss',
} as const;
export type TrialOutcome = typeof TrialOutcome[keyof typeof TrialOutcome];

// ... (las interfaces TrialEntry, SessionMetrics y GameConfig se quedan igual)

export interface TrialEntry {
  trialIndex: number;
  itemType: ItemType;
  zone: Zone;
  stimulusOnset: number;
  responseTime: number | null;
  outcome: TrialOutcome;
}

export interface SessionMetrics {
  sessionId: string;
  timestamp: string;
  totalTrials: number;
  hits: number;
  misses: number;
  correctRejections: number;
  commissionErrors: number;
  omissionErrors: number;
  reactionTimes: {
    star: number[];
    shield: number[];
  };
  averageRT_star: number;
  averageRT_shield: number;
  rtVariability_star: number;
  trialLog: TrialEntry[];
}

export interface GameConfig {
  totalTrials: number;
  starRatio: number;
  debrisRatio: number;
  itemIntervalMs: number;
  stimulusWindowMs: number;
  zones: {
    name: Zone;
    threshold: number;
    skybox: string;
    bgm: string;
    planet: string;
  }[];
}
