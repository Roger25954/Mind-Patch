import * as THREE from 'three';
import type { GameConfig } from '../types';
import { ItemType } from '../types';
import StarItem from '../entities/StarItem';
import DebrisItem from '../entities/DebrisItem';

type OnItemFn = (item: StarItem | DebrisItem, trialIndex: number) => void;

export default class SpawnSystem {
  private scene: THREE.Scene;
  private config: GameConfig;
  private sequence: ItemType[] = [];
  private timerId: number | null = null;
  private _currentIndex = 0;
  private isPaused = false;

  constructor(scene: THREE.Scene, config: GameConfig) {
    this.scene = scene;
    this.config = config;
    this.sequence = this.generateSequence();
  }

  private _hashSeed(sessionId: string | undefined): number {
    const s = sessionId || 'default-session-seed';
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    }
    return h >>> 0;
  }

  private _mulberry32(a: number) {
    return function() {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

generateSequence(): ItemType[] {
    const total = this.config.totalTrials;
    const starCount = Math.round(total * this.config.starRatio);
    const debrisCount = total - starCount;

    const sessionId = (this.config as any).sessionId as string | undefined;
    const seed = this._hashSeed(sessionId);
    const rand = this._mulberry32(seed);

    let remainingStar = starCount;
    let remainingDebris = debrisCount;

    const seq: ItemType[] = [];
    // AHORA limitamos las estrellas consecutivas, ya que son el No-Go infrecuente
    const maxConsecStar = 3; 

    while (seq.length < total) {
      const last = seq.slice(-maxConsecStar);
      const lastStarRun = last.filter((v) => v === ItemType.STAR).length === last.length && last.length > 0;

      const chooseStarAllowed = !lastStarRun && remainingStar > 0;
      const chooseDebrisAllowed = remainingDebris > 0;

      let pickDebris = false;
      if (!chooseDebrisAllowed && chooseStarAllowed) pickDebris = false;
      else if (!chooseStarAllowed && chooseDebrisAllowed) pickDebris = true;
      else if (chooseDebrisAllowed && chooseStarAllowed) {
        // Probabilidad ponderada
        const p = remainingDebris / (remainingDebris + remainingStar);
        pickDebris = rand() < p;
      }

      if (pickDebris) {
        seq.push(ItemType.DEBRIS);
        remainingDebris--;
      } else {
        seq.push(ItemType.STAR);
        remainingStar--;
      }
    }

    while (remainingStar-- > 0) seq.push(ItemType.STAR);
    while (remainingDebris-- > 0) seq.push(ItemType.DEBRIS);

    return seq;
  }

  start(onItem: OnItemFn): void {
    if (this.timerId !== null) return; // already started
    const interval = this.config.itemIntervalMs;
    this._currentIndex = 0;

    const spawnOne = () => {
      if (this._currentIndex >= this.sequence.length) {
        if (this.timerId !== null) {
          clearInterval(this.timerId);
          this.timerId = null;
        }
        return;
      }

      const type = this.sequence[this._currentIndex];
      // random x,y jitter
      const x = (Math.random() * 4) - 2; // -2..2
      const y = (Math.random() - 0.5) * 1.0; // -0.5..0.5

    let item: StarItem | DebrisItem;
      if (type === ItemType.STAR) {
        item = new StarItem(this.scene); 
      } else {
        // Le pasamos el tiempo exacto que configuraste para el nivel
        item = new DebrisItem(this.scene, this.config.stimulusWindowMs);
      }

      // position tweak
      item.root.position.x = x;
      item.root.position.y = y;

      onItem(item, this._currentIndex);
      this._currentIndex += 1;
    };

    // spawn immediately then interval
    spawnOne();
    this.timerId = window.setInterval(() => {
      if (!this.isPaused) spawnOne();
    }, interval);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  get currentTrialIndex(): number {
    return this._currentIndex;
  }

  get isComplete(): boolean {
    return this._currentIndex >= this.sequence.length;
  }
}
