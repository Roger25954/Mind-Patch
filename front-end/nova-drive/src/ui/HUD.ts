import { Zone } from '../types';

export default class HUD {
  private container: HTMLDivElement;
  private energyBarFill: HTMLDivElement;
  private zoneLabel: HTMLDivElement;
  private trialLabel: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      fontFamily: 'Orbitron, sans-serif',
      zIndex: '1000',
    });

    // Zone display (top-left)
    this.zoneLabel = document.createElement('div');
    Object.assign(this.zoneLabel.style, {
      position: 'absolute',
      left: '12px',
      top: '12px',
      color: '#BFEFFF',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      pointerEvents: 'none',
    });
    const planetIcon = document.createElement('div');
    Object.assign(planetIcon.style, {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      background: 'linear-gradient(90deg,#6fd1ff,#ffd76f)',
      boxShadow: '0 0 6px rgba(111,209,255,0.6)',
    });
    const zoneText = document.createElement('div');
    zoneText.textContent = 'EARTH';
    this.zoneLabel.appendChild(planetIcon);
    this.zoneLabel.appendChild(zoneText);

    // Trial counter (top-right)
    this.trialLabel = document.createElement('div');
    Object.assign(this.trialLabel.style, {
      position: 'absolute',
      right: '12px',
      top: '12px',
      color: '#CFFFB3',
      fontSize: '14px',
      pointerEvents: 'none',
      textAlign: 'right',
    });
    this.trialLabel.textContent = 'SECTOR: 000/000';

    // Energy bar (bottom center)
    const energyWrap = document.createElement('div');
    Object.assign(energyWrap.style, {
      position: 'absolute',
      left: '50%',
      bottom: '24px',
      transform: 'translateX(-50%)',
      width: '60%',
      maxWidth: '900px',
      height: '36px',
      pointerEvents: 'none',
    });

    const label = document.createElement('div');
    label.textContent = 'ENERGÍA NOVA';
    Object.assign(label.style, {
      color: '#EAF8FF',
      fontSize: '12px',
      textAlign: 'center',
      marginBottom: '6px',
      textShadow: '0 1px 0 rgba(0,0,0,0.6)'
    });

    const barBg = document.createElement('div');
    Object.assign(barBg.style, {
      width: '100%',
      height: '12px',
      background: 'rgba(0,0,0,0.45)',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
    });

    this.energyBarFill = document.createElement('div');
    Object.assign(this.energyBarFill.style, {
      height: '100%',
      width: '100%',
      transformOrigin: 'left center',
      transition: 'width 0.25s ease',
      background: 'linear-gradient(90deg,#4FC3F7,#FFD76F)',
    });

    // markers
    const markers = [0.1, 0.4, 0.8];
    for (const m of markers) {
      const mark = document.createElement('div');
      Object.assign(mark.style, {
        position: 'absolute',
        left: `${m * 100}%`,
        top: '-6px',
        width: '2px',
        height: '24px',
        background: 'rgba(0,0,0,0.35)',
        transform: 'translateX(-1px)'
      });
      barBg.appendChild(mark);
    }

    barBg.appendChild(this.energyBarFill);
    energyWrap.appendChild(label);
    energyWrap.appendChild(barBg);

    this.container.appendChild(this.zoneLabel);
    this.container.appendChild(this.trialLabel);
    this.container.appendChild(energyWrap);

    document.body.appendChild(this.container);
  }

  updateEnergy(percent: number): void {
    const p = Math.max(0, Math.min(1, percent));
    this.energyBarFill.style.width = `${p * 100}%`;
  }

  updateZone(zone: Zone): void {
    const zoneName = zone.toString().toUpperCase();
    // second child of zoneLabel is text node
    const textNode = this.zoneLabel.children[1] as HTMLElement;
    textNode.textContent = zoneName;
  }

  updateTrial(current: number, total: number): void {
    const cur = String(current).padStart(3, '0');
    const tot = String(total).padStart(3, '0');
    this.trialLabel.textContent = `SECTOR: ${cur}/${tot}`;
  }
}
