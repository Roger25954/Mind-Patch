import * as THREE from 'three';
import MetricsSystem from '../systems/MetricsSystem';
import AudioManager  from '../systems/AudioManager';
import type { SessionMetrics } from '../types';

// Duración total de la animación en segundos
const ANIM_DURATION = 8;

// Mensajes secuenciales (en segundos desde el inicio)
const MESSAGES: Array<{ at: number; text: string }> = [
  { at: 0.5, text: 'MISIÓN COMPLETADA'           },
  { at: 2.5, text: 'La humanidad tiene esperanza' },
  { at: 4.5, text: 'Datos de sesión guardados'    },
];

export default class EndingScene {
  public  scene:    THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera:   THREE.PerspectiveCamera;
  private metrics:  MetricsSystem;
  private audio:    AudioManager;
  private onReplay: () => void;

  // Partículas de galaxia
  private points:    THREE.Points;
  private positions: Float32Array;
  private speeds:    Float32Array;

  // Estado de animación
  private elapsed       = 0;
  private animDone      = false;
  private msgIndex      = 0;
  private jsonExported  = false;

  // Overlay HTML
  private overlay:   HTMLDivElement;
  private msgEl:     HTMLParagraphElement;
  private summaryEl: HTMLDivElement;
  private replayBtn: HTMLButtonElement;

  constructor(
    renderer:  THREE.WebGLRenderer,
    camera:    THREE.PerspectiveCamera,
    metrics:   MetricsSystem,
    audio:     AudioManager,
    onReplay:  () => void,
  ) {
    this.renderer  = renderer;
    this.camera    = camera;
    this.metrics   = metrics;
    this.audio     = audio;
    this.onReplay  = onReplay;

    // ── Escena ────────────────────────────────────────────────────────────────
    this.scene  = new THREE.Scene();

    // ── Partículas (galaxia que se aleja) ─────────────────────────────────────
    const COUNT    = 4000;
    this.positions = new Float32Array(COUNT * 3);
    this.speeds    = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Distribución en disco espiral aproximado
      const r     = 5 + Math.random() * 160;
      const theta = Math.random() * Math.PI * 2;
      const y     = (Math.random() - 0.5) * 20;
      this.positions[i * 3]     = r * Math.cos(theta);
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = r * Math.sin(theta);
      this.speeds[i]             = 0.4 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffeedd, size: 0.9, sizeAttenuation: true,
      transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
      vertexColors: false,
    });
    new THREE.TextureLoader().load('/textures/glow.png', (t) => { mat.map = t; mat.needsUpdate = true; });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    // ── Overlay HTML ──────────────────────────────────────────────────────────
    const { overlay, msgEl, summaryEl, replayBtn } = this.buildOverlay();
    this.overlay   = overlay;
    this.msgEl     = msgEl;
    this.summaryEl = summaryEl;
    this.replayBtn = replayBtn;
    document.body.appendChild(this.overlay);

    // Ajuste de cámara
    this.camera.position.set(0, 60, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 75;
    this.camera.updateProjectionMatrix();
  }

  // ── HTML ──────────────────────────────────────────────────────────────────
  private buildOverlay() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '300',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Orbitron", sans-serif',
      pointerEvents: 'none',
      background: 'rgba(0,0,0,0)',
    });

    const msgEl = document.createElement('p');
    Object.assign(msgEl.style, {
      fontSize: 'clamp(1.2rem, 4vw, 2rem)', margin: '0 0 2rem',
      color: '#4FC3F7', letterSpacing: '0.15em',
      textShadow: '0 0 30px #4FC3F7',
      opacity: '0', transition: 'opacity 0.7s ease',
      textAlign: 'center', padding: '0 1rem',
    });

    const summaryEl = document.createElement('div');
    Object.assign(summaryEl.style, {
      opacity: '0', transition: 'opacity 1s ease 0.3s',
      textAlign: 'center', marginBottom: '2.5rem',
      fontFamily: '"Rajdhani", sans-serif',
      color: '#cce8ff', fontSize: 'clamp(0.85rem, 2vw, 1rem)',
      lineHeight: '1.8',
    });

    const replayBtn = document.createElement('button');
    replayBtn.textContent = 'JUGAR DE NUEVO';
    Object.assign(replayBtn.style, {
      padding: '0.9rem 2.5rem',
      fontSize: 'clamp(0.8rem, 2vw, 1rem)',
      fontFamily: '"Orbitron", sans-serif', fontWeight: '700',
      letterSpacing: '0.12em', cursor: 'pointer',
      border: '2px solid #FFD700', background: 'rgba(255,215,0,0.1)',
      color: '#FFD700', borderRadius: '4px',
      textShadow: '0 0 10px #FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.3)',
      transition: 'all 0.25s ease', opacity: '0',
      pointerEvents: 'none',
    });
    replayBtn.addEventListener('mouseenter', () => {
      replayBtn.style.background  = 'rgba(255,215,0,0.25)';
      replayBtn.style.boxShadow   = '0 0 40px rgba(255,215,0,0.6)';
    });
    replayBtn.addEventListener('mouseleave', () => {
      replayBtn.style.background  = 'rgba(255,215,0,0.1)';
      replayBtn.style.boxShadow   = '0 0 20px rgba(255,215,0,0.3)';
    });
    replayBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); this.onReplay(); }, 700);
    });

    overlay.append(msgEl, summaryEl, replayBtn);
    return { overlay, msgEl, summaryEl, replayBtn };
  }

  // ── Mostrar un mensaje con fade ───────────────────────────────────────────
  private showMessage(text: string): void {
    this.msgEl.style.opacity = '0';
    setTimeout(() => {
      this.msgEl.textContent   = text;
      this.msgEl.style.opacity = '1';
    }, 400);
  }

  // ── Resumen de métricas ───────────────────────────────────────────────────
  private showSummary(m: SessionMetrics): void {
    const rows: Array<[string, string]> = [
      ['⭐  Estrellas capturadas',      `${m.hits} / 320`],
      ['❌  Omisiones (inatención)',     String(m.misses)],
      ['⚡  Errores de impulsividad',   String(m.commissionErrors)],
      ['⏱  Tiempo de reacción medio',  `${m.averageRT_star.toFixed(0)} ms`],
      ['📊  Variabilidad (SD)',          `${m.rtVariability_star.toFixed(0)} ms`],
    ];

    this.summaryEl.innerHTML = rows
      .map(([label, val]) =>
        `<div style="display:flex;justify-content:space-between;gap:2rem;border-bottom:1px solid rgba(255,255,255,0.08);padding:0.2rem 0">
           <span>${label}</span>
           <span style="color:#FFD700;font-weight:700">${val}</span>
         </div>`)
      .join('');

    // Envolver en caja semitransparente
    Object.assign(this.summaryEl.style, {
      background:   'rgba(0,10,30,0.7)',
      border:       '1px solid rgba(79,195,247,0.25)',
      borderRadius: '8px',
      padding:      '1.2rem 2rem',
      minWidth:     'min(420px, 88vw)',
    });

    this.summaryEl.style.opacity = '1';
  }

  // ── Game loop ─────────────────────────────────────────────────────────────
  update(delta: number): void {
    if (this.animDone) return;

    this.elapsed += delta;
    const t = this.elapsed;

    // ── Mensajes secuenciales ──────────────────────────────────────────────
    while (this.msgIndex < MESSAGES.length && t >= MESSAGES[this.msgIndex].at) {
      this.showMessage(MESSAGES[this.msgIndex].text);
      this.msgIndex++;
    }

    // ── Exportar JSON una sola vez (al mostrar el 3er mensaje) ────────────
    if (!this.jsonExported && t >= MESSAGES[2].at) {
      this.metrics.exportJSON();
      this.jsonExported = true;
    }

    // ── Mover partículas alejándose (cámara mira desde arriba) ────────────
    const p = this.positions;
    for (let i = 0; i < p.length / 3; i++) {
      const ix = i * 3;
      // Alejar en X y Z respecto al origen (la galaxia se "va")
      p[ix]     += p[ix]     * this.speeds[i] * delta * 0.012;
      p[ix + 2] += p[ix + 2] * this.speeds[i] * delta * 0.012;
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Rotar levemente el disco
    this.points.rotation.y += delta * 0.04;

    // Cámara alejándose hacia arriba (efecto de salida de la galaxia)
    this.camera.position.y += delta * 6;
    this.camera.lookAt(0, 0, 0);

    // ── Al terminar la animación ──────────────────────────────────────────
    if (t >= ANIM_DURATION && !this.animDone) {
      this.animDone = true;

      // Mostrar resumen y botón
      const sessionData = this.metrics.getSessionMetrics();
      this.showSummary(sessionData);

      this.msgEl.textContent   = '✦  MISIÓN COMPLETADA  ✦';
      this.msgEl.style.opacity = '1';
      this.msgEl.style.color   = '#FFD700';

      // Habilitar botón con fade in
      this.replayBtn.style.opacity      = '1';
      this.replayBtn.style.pointerEvents = 'auto';
      this.overlay.style.pointerEvents   = 'auto';
    }
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).dispose();
    if (this.overlay.parentElement) this.overlay.remove();
  }
}