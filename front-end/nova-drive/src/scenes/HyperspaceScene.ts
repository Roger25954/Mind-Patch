import * as THREE from 'three';
import { Zone } from '../types';

const ZONE_NAMES: Record<Zone, string> = {
  [Zone.EARTH]:   'TIERRA',
  [Zone.MOON]:    'LUNA',
  [Zone.MARS]:    'MARTE',
  [Zone.JUPITER]: 'JÚPITER',
};

const PARTICLE_COUNT = 2000;
const SPHERE_RADIUS  = 200;
const DURATION       = 4.0; // segundos totales

// Velocidades de las partículas por fase (unidades/segundo hacia la cámara)
const SPEED_IDLE   =   2;
const SPEED_WARP   = 180;
const SPEED_SLOW   =  20;

// FOV de la cámara perspectiva por fase
const FOV_NORMAL   = 60;
const FOV_WARP     = 30;

export default class HyperspaceScene {
  public  scene:    THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera:   THREE.PerspectiveCamera;

  // Partículas
  private points:     THREE.Points;
  private positions:  Float32Array; // posiciones actuales xyz
  private velocities: Float32Array; // velocidad por partícula (escalar en eje Z)

  // Estado de la transición
  private playing    = false;
  private elapsed    = 0;
  private onComplete: (() => void) | null = null;
  private toZone:     Zone | null = null;

  // Overlay HTML
  private overlay: HTMLDivElement;
  private label:   HTMLParagraphElement;

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    this.renderer = renderer;
    this.camera   = camera;

    // ── Escena ────────────────────────────────────────────────────────────────
    this.scene            = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // ── Partículas ─────────────────────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    this.positions  = new Float32Array(PARTICLE_COUNT * 3);
    this.velocities = new Float32Array(PARTICLE_COUNT);

    this.randomizePositions();

    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Intentar cargar textura; si falla, usar círculo por defecto
    const texLoader = new THREE.TextureLoader();
    const mat = new THREE.PointsMaterial({
      color:           0xaaddff,
      size:            1.2,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.85,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
    });

    texLoader.load(
      '/textures/glow.png',
      (tex) => { mat.map = tex; mat.needsUpdate = true; },
      undefined,
      () => texLoader.load('/textures/smoke.png', (tex) => { mat.map = tex; mat.needsUpdate = true; })
    );

    this.points = new THREE.Points(geo, mat);
    this.scene.add(this.points);

    // ── Overlay HTML ───────────────────────────────────────────────────────────
    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position:        'fixed',
      inset:           '0',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      flexDirection:   'column',
      pointerEvents:   'none',
      zIndex:          '100',
      opacity:         '0',
      transition:      'opacity 0.4s ease',
      fontFamily:      '"Orbitron", sans-serif',
      color:           '#4FC3F7',
      textShadow:      '0 0 20px #4FC3F7',
      letterSpacing:   '0.15em',
    });

    const title = document.createElement('h1');
    title.textContent = 'WARP DRIVE';
    Object.assign(title.style, { fontSize: '3rem', margin: '0 0 1rem', color: '#ffffff' });

    this.label = document.createElement('p');
    Object.assign(this.label.style, { fontSize: '1.2rem', margin: '0' });

    this.overlay.appendChild(title);
    this.overlay.appendChild(this.label);
    document.body.appendChild(this.overlay);
  }

  // ── Posiciones iniciales ────────────────────────────────────────────────────
  private randomizePositions(): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Punto aleatorio en esfera
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = SPHERE_RADIUS * (0.3 + Math.random() * 0.7);

      this.positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      this.positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      this.positions[i * 3 + 2] = r * Math.cos(phi);

      // Velocidad base aleatoria para variedad
      this.velocities[i] = 0.7 + Math.random() * 0.6;
    }
  }

  // ── Iniciar transición ──────────────────────────────────────────────────────
  play(toZone: Zone, onComplete: () => void): void {
    this.toZone     = toZone;
    this.onComplete = onComplete;
    this.elapsed    = 0;
    this.playing    = true;

    // Resetear posiciones
    this.randomizePositions();
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Resetear FOV
    this.camera.fov = FOV_NORMAL;
    this.camera.updateProjectionMatrix();

    // Mostrar overlay
    this.overlay.style.opacity = '1';
    this.setLabel('CALCULANDO RUTA WARP...');
  }

  // ── Texto del overlay ───────────────────────────────────────────────────────
  private setLabel(text: string): void {
    this.label.textContent = text;
  }

  // ── Ocultar overlay ─────────────────────────────────────────────────────────
  private hideOverlay(): void {
    this.overlay.style.opacity = '0';
  }

  // ── Interpolar FOV suavemente ───────────────────────────────────────────────
  private lerpFOV(target: number, alpha: number): void {
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, target, alpha);
    this.camera.updateProjectionMatrix();
  }

  // ── Game loop ───────────────────────────────────────────────────────────────
  update(delta: number): void {
    if (!this.playing) return;

    this.elapsed += delta;
    const t = this.elapsed;

    // ── Determinar fase y velocidad ──────────────────────────────────────────
    let speed: number;

    if (t < 1.0) {
      // Fase 1: Aceleración (0–1s)
      const p = t / 1.0; // 0→1
      speed = THREE.MathUtils.lerp(SPEED_IDLE, SPEED_WARP, p * p);
      this.lerpFOV(FOV_WARP, delta * 3);
      this.setLabel('CALCULANDO RUTA WARP...');

    } else if (t < 3.0) {
      // Fase 2: Warp completo (1–3s)
      speed = SPEED_WARP;
      this.lerpFOV(FOV_WARP, delta * 8);
      this.setLabel(`VIAJANDO A ${ZONE_NAMES[this.toZone!] ?? ''}`);

    } else if (t < DURATION) {
      // Fase 3: Deceleración (3–4s)
      const p = (t - 3.0) / 1.0; // 0→1
      speed = THREE.MathUtils.lerp(SPEED_WARP, SPEED_SLOW, p);
      this.lerpFOV(FOV_NORMAL, delta * 4);
      this.setLabel('LLEGANDO...');
      // Fade out del overlay en la última fase
      const opacity = Math.max(0, 1 - p);
      this.overlay.style.opacity = String(opacity);

    } else {
      // Finalizado
      this.playing = false;
      this.camera.fov = FOV_NORMAL;
      this.camera.updateProjectionMatrix();
      this.hideOverlay();
      this.onComplete?.();
      return;
    }

    // ── Mover partículas hacia la cámara (eje -Z en espacio local) ───────────
    const pos = this.positions;
    const camPos = this.camera.position;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // Dirección desde partícula hacia cámara, normalizada
      const dx = camPos.x - pos[ix];
      const dy = camPos.y - pos[iy];
      const dz = camPos.z - pos[iz];
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

      pos[ix] += (dx / len) * speed * this.velocities[i] * delta;
      pos[iy] += (dy / len) * speed * this.velocities[i] * delta;
      pos[iz] += (dz / len) * speed * this.velocities[i] * delta;

      // Si la partícula llega demasiado cerca, reposicionarla al otro lado
      if (len < 5) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = SPHERE_RADIUS * (0.6 + Math.random() * 0.4);
        pos[ix] = camPos.x + r * Math.sin(phi) * Math.cos(theta);
        pos[iy] = camPos.y + r * Math.sin(phi) * Math.sin(theta);
        pos[iz] = camPos.z + r * Math.cos(phi);
      }
    }

    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // ── Tamaño de partículas: más grande durante warp ────────────────────────
    const mat = this.points.material as THREE.PointsMaterial;
    if (t >= 1.0 && t < 3.0) {
      mat.size = THREE.MathUtils.lerp(mat.size, 3.5, delta * 4);
    } else {
      mat.size = THREE.MathUtils.lerp(mat.size, 1.2, delta * 3);
    }
  }

  // ── Limpieza ─────────────────────────────────────────────────────────────────
  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).dispose();
    this.scene.remove(this.points);
    if (this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay);
    }
  }
}