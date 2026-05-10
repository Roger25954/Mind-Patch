import * as THREE from 'three';
import AudioManager from '../systems/AudioManager';

export default class IntroScene {
  public  scene:    THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera:   THREE.PerspectiveCamera;
  private audio:    AudioManager;
  private onStart:  () => void;

  // Partículas de fondo
  private points:    THREE.Points;
  private positions: Float32Array;
  private time = 0;

  // Overlay HTML
  private overlay: HTMLDivElement;

  constructor(
    renderer: THREE.WebGLRenderer,
    camera:   THREE.PerspectiveCamera,
    audio:    AudioManager,
    onStart:  () => void,
  ) {
    this.renderer = renderer;
    this.camera   = camera;
    this.audio    = audio;
    this.onStart  = onStart;

    // ── Escena Three.js (fondo con partículas) ────────────────────────────────
    this.scene            = new THREE.Scene();

    const COUNT = 3000;
    this.positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      this.positions[i * 3]     = (Math.random() - 0.5) * 400;
      this.positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xaaccff, size: 0.8, sizeAttenuation: true,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    new THREE.TextureLoader().load('/textures/glow.png', (t) => { mat.map = t; mat.needsUpdate = true; });

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    // Luz ambiental mínima
    this.scene.add(new THREE.AmbientLight(0x111133, 1));

    // ── Overlay HTML ──────────────────────────────────────────────────────────
    this.overlay = this.buildOverlay();
    document.body.appendChild(this.overlay);
  }

  // ── Construir el HTML de la pantalla de título ────────────────────────────
  private buildOverlay(): HTMLDivElement {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'fixed', inset: '0', zIndex: '200',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Orbitron", sans-serif',
      background: 'radial-gradient(ellipse at center, rgba(0,10,30,0.85) 0%, rgba(0,0,0,0.95) 100%)',
      transition: 'opacity 0.8s ease',
    });

    // Logo
    const logo = document.createElement('h1');
    logo.textContent = 'NOVA DRIVE';
    Object.assign(logo.style, {
      fontSize: 'clamp(2.5rem, 8vw, 5rem)', margin: '0',
      color: '#4FC3F7', letterSpacing: '0.2em',
      textShadow: '0 0 40px #4FC3F7, 0 0 80px #0088cc',
      animation: 'novaPulse 3s ease-in-out infinite',
    });

    // Subtítulo
    const sub = document.createElement('p');
    sub.textContent = 'THE LAST ENERGY RUN';
    Object.assign(sub.style, {
      fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)', margin: '0.4rem 0 2.5rem',
      color: '#FFD700', letterSpacing: '0.35em',
      textShadow: '0 0 15px #FFD700',
    });

    // Separador
    const hr = document.createElement('div');
    Object.assign(hr.style, {
      width: 'min(480px, 80vw)', height: '1px',
      background: 'linear-gradient(90deg, transparent, #4FC3F7, transparent)',
      margin: '0 0 2rem',
    });

    // Instrucciones
    const instructions = [
      { icon: '⚡', text: 'ESPACIO  →  Captura estrellas de energía' },
      { icon: '🛡', text: 'ESPACIO  →  Activa escudo ante asteroides' },
    ];
    const instrWrap = document.createElement('div');
    Object.assign(instrWrap.style, { marginBottom: '2.5rem', textAlign: 'center' });

    for (const { icon, text } of instructions) {
      const row = document.createElement('p');
      row.textContent = `${icon}  ${text}`;
      Object.assign(row.style, {
        fontSize: 'clamp(0.75rem, 2vw, 1rem)', margin: '0.5rem 0',
        color: '#cce8ff', letterSpacing: '0.08em',
        fontFamily: '"Rajdhani", sans-serif', fontWeight: '600',
      });
      instrWrap.appendChild(row);
    }

    // Botón
    const btn = document.createElement('button');
    btn.textContent = 'INICIAR MISIÓN';
    Object.assign(btn.style, {
      padding: '1rem 3rem', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
      fontFamily: '"Orbitron", sans-serif', fontWeight: '700',
      letterSpacing: '0.15em', cursor: 'pointer', border: '2px solid #4FC3F7',
      background: 'rgba(79,195,247,0.12)', color: '#4FC3F7',
      borderRadius: '4px', transition: 'all 0.25s ease',
      textShadow: '0 0 10px #4FC3F7', boxShadow: '0 0 20px rgba(79,195,247,0.3)',
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.background   = 'rgba(79,195,247,0.28)';
      btn.style.boxShadow    = '0 0 40px rgba(79,195,247,0.6)';
      btn.style.transform    = 'scale(1.04)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background   = 'rgba(79,195,247,0.12)';
      btn.style.boxShadow    = '0 0 20px rgba(79,195,247,0.3)';
      btn.style.transform    = 'scale(1)';
    });
    btn.addEventListener('click', () => this.handleStart());

    // Versión / crédito pequeño
    const credit = document.createElement('p');
    credit.textContent = 'Evaluación TDAH — Paradigma Go/No-Go';
    Object.assign(credit.style, {
      position: 'absolute', bottom: '1.5rem',
      fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
      letterSpacing: '0.12em', fontFamily: '"Rajdhani", sans-serif',
    });

    // Keyframes de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes novaPulse {
        0%,100% { text-shadow: 0 0 40px #4FC3F7, 0 0 80px #0088cc; }
        50%      { text-shadow: 0 0 60px #4FC3F7, 0 0 120px #00aaff, 0 0 160px #0044ff; }
      }
    `;
    document.head.appendChild(style);

    wrap.append(logo, sub, hr, instrWrap, btn, credit);
    return wrap;
  }

  // ── Click en botón ────────────────────────────────────────────────────────
  private handleStart(): void {
    this.audio.playSFX('sfx_warp_start');
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay.remove();
      this.onStart();
    }, 850);
  }

  // ── Game loop ─────────────────────────────────────────────────────────────
  update(delta: number): void {
    this.time += delta;
    // Rotar suavemente el campo de estrellas
    this.points.rotation.y += delta * 0.015;
    this.points.rotation.x  = Math.sin(this.time * 0.05) * 0.08;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).dispose();
    if (this.overlay.parentElement) this.overlay.remove();
  }
}