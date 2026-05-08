import gsap from 'gsap';

export default class PromptOverlay {
  private container: HTMLDivElement;
  private content: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: '1500',
      fontFamily: 'Orbitron, sans-serif',
    });

    this.content = document.createElement('div');
    Object.assign(this.content.style, {
      minWidth: '320px',
      padding: '24px 32px',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#FFF',
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
      opacity: '0',
      transform: 'translateY(80px)',
    });

    this.container.appendChild(this.content);
    document.body.appendChild(this.container);
  }

  showStarPrompt(): void {
    this.content.innerHTML = `<div style="font-size:24px;opacity:0.95">⚡ CAPTURA LA ENERGÍA</div><div style="font-size:48px;margin-top:8px; color:#FFD700;">[ESPACIO]</div>`;
    Object.assign(this.content.style, { color: '#FFF', background: 'rgba(0,0,0,0.18)' });
    gsap.killTweensOf(this.content);
    gsap.fromTo(this.content, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
  }

  showDebrisPrompt(): void {
    this.content.innerHTML = `<div style="font-size:24px;opacity:0.95">🛡 ACTIVA ESCUDO</div><div style="font-size:48px;margin-top:8px; color:#FF6666;">[ESPACIO]</div>`;
    Object.assign(this.content.style, { color: '#FFF', background: 'rgba(0,0,0,0.18)' });
    gsap.killTweensOf(this.content);
    gsap.fromTo(this.content, { y: 80, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 });
  }

  hide(): void {
    gsap.killTweensOf(this.content);
    gsap.to(this.content, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in' });
  }
}
