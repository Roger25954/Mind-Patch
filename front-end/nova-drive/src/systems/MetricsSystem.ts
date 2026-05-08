import { ItemType, Zone, TrialOutcome } from '../types';
import type { TrialEntry, SessionMetrics } from '../types';

export default class MetricsSystem {
  private sessionId: string;
  private trialLog: TrialEntry[] = [];
  private commissionErrorsCount = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  startTrial(trialIndex: number, itemType: ItemType, zone: Zone): void {
    const existing = this.trialLog.find((t) => t.trialIndex === trialIndex);
    const entry: TrialEntry = {
      trialIndex,
      itemType,
      zone,
      stimulusOnset: performance.now(),
      responseTime: null,
      outcome: TrialOutcome.MISS,
    };

    if (existing) {
      // replace
      Object.assign(existing, entry);
    } else {
      this.trialLog.push(entry);
    }
  }

  recordResponse(trialIndex: number, responseTime: number): void {
    const entry = this.trialLog.find((t) => t.trialIndex === trialIndex);
    if (!entry) {
      console.warn('No trial found for recordResponse', trialIndex);
      return;
    }
    // treat responseTime as timestamp (performance.now()) and compute RT
    const rt = responseTime - entry.stimulusOnset;
    entry.responseTime = Number.isFinite(rt) ? rt : null;
  }

  recordOutcome(trialIndex: number, outcome: TrialOutcome): void {
    const entry = this.trialLog.find((t) => t.trialIndex === trialIndex);
    if (!entry) {
      console.warn('No trial found for recordOutcome', trialIndex);
      return;
    }
    entry.outcome = outcome;
  }

  recordCommissionError(): void {
    this.commissionErrorsCount += 1;
  }

  calculateSD(values: number[]): number {
    if (!values || values.length === 0) return 0;
    const n = values.length;
    const mean = values.reduce((s, v) => s + v, 0) / n;
    if (n === 1) return 0;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
  }

  private mean(values: number[]): number {
    if (!values || values.length === 0) return 0;
    return values.reduce((s, v) => s + v, 0) / values.length;
  }

  getSessionMetrics(): SessionMetrics {
    const timestamp = new Date().toISOString();
    const totalTrials = this.trialLog.length;

    let hits = 0;
    let misses = 0;
    let correctRejections = 0;
    let commissionErrors = this.commissionErrorsCount;
    let omissionErrors = 0;

    const starRTs: number[] = [];
    const shieldRTs: number[] = [];

    for (const t of this.trialLog) {
      switch (t.outcome) {
        case TrialOutcome.HIT:
          hits += 1;
          break;
        case TrialOutcome.MISS:
          misses += 1;
          break;
        case TrialOutcome.CORRECT_REJECTION:
          correctRejections += 1;
          break;
        case TrialOutcome.COMMISSION_ERROR:
          commissionErrors += 1;
          break;
        default:
          break;
      }

      if (t.itemType === ItemType.STAR && t.outcome === TrialOutcome.MISS) omissionErrors += 1;

      if (t.responseTime != null) {
        // star RTs
        if (t.itemType === ItemType.STAR) starRTs.push(t.responseTime);
        // shield RTs (responses to shields)
        if (t.outcome === TrialOutcome.SHIELD_HIT || t.outcome === TrialOutcome.SHIELD_MISS) shieldRTs.push(t.responseTime);
      }
    }

    const averageRT_star = this.mean(starRTs);
    const averageRT_shield = this.mean(shieldRTs);
    const rtVariability_star = this.calculateSD(starRTs);

    const metrics: SessionMetrics = {
      sessionId: this.sessionId,
      timestamp,
      totalTrials,
      hits,
      misses,
      correctRejections,
      commissionErrors,
      omissionErrors,
      reactionTimes: {
        star: starRTs,
        shield: shieldRTs,
      },
      averageRT_star,
      averageRT_shield,
      rtVariability_star,
      trialLog: this.trialLog.slice().sort((a, b) => a.trialIndex - b.trialIndex),
    };

    return metrics;
  }

  exportJSON(): void {
    const metrics = this.getSessionMetrics();
    const json = JSON.stringify(metrics, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nova_drive_session_${this.sessionId}_${ts}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
