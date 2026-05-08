import { Zone } from '../types';
import type { GameConfig } from '../types';
import HUD from '../ui/HUD';

export default class EnergySystem {
  public totalStars: number;
  public capturedStars: number = 0;
  private hud: HUD;
  private config: GameConfig;
  private _currentZone: Zone = Zone.EARTH;

  constructor(config: GameConfig, hud: HUD) {
    this.config = config;
    this.hud = hud;
    // default to config proportions, but ensure integer
    this.totalStars = Math.round((config.totalTrials || 400) * (config.starRatio || 0.8));
    // initialize HUD
    this.hud.updateEnergy(0);
    this.hud.updateZone(this._currentZone);
  }

  get energyPercent(): number {
    if (this.totalStars <= 0) return 0;
    return Math.min(1, this.capturedStars / this.totalStars);
  }

  addEnergy(): void {
    this.capturedStars = Math.min(this.totalStars, this.capturedStars + 1);
    this.hud.updateEnergy(this.energyPercent);
  }

  checkZoneThreshold(): Zone | null {
    // thresholds based on fractions of totalStars
    const moonCount = Math.ceil(0.10 * this.totalStars); // 10%
    const marsCount = Math.ceil(0.40 * this.totalStars); // 40%
    const jupiterCount = Math.ceil(0.80 * this.totalStars); // 80%

    let newZone: Zone | null = null;
    if (this.capturedStars >= jupiterCount && this._currentZone !== Zone.JUPITER) {
      newZone = Zone.JUPITER;
    } else if (this.capturedStars >= marsCount && this._currentZone !== Zone.MARS) {
      newZone = Zone.MARS;
    } else if (this.capturedStars >= moonCount && this._currentZone !== Zone.MOON) {
      newZone = Zone.MOON;
    }

    if (newZone) {
      this._currentZone = newZone;
      this.hud.updateZone(this._currentZone);
      return newZone;
    }

    // if reached 100% (ending) we do not map to a Zone enum; return null but HUD is already updated by energy
    return null;
  }

  get currentZone(): Zone {
    return this._currentZone;
  }

  get isComplete(): boolean {
    return this.energyPercent >= 1;
  }
}
