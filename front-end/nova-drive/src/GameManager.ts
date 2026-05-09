import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import AudioManager    from './systems/AudioManager';
import MetricsSystem   from './systems/MetricsSystem';
import IntroScene      from './scenes/IntroScene';
import GameScene       from './scenes/GameScene';
import HyperspaceScene from './scenes/HyperspaceScene';
import EndingScene     from './scenes/EndingScene';

import { GAME_CONFIG, ASSET_PATHS } from './constants';
import { Zone } from './types';
import { v4 as uuidv4 } from 'uuid';

// ── Elementos de la pantalla de carga ────────────────────────────────────────
const loadingScreen  = document.getElementById('loading-screen')  as HTMLDivElement;
const loadingBarFill = document.getElementById('loading-bar-fill') as HTMLDivElement;
const loadingPct     = document.getElementById('loading-pct')     as HTMLParagraphElement;
const loadingSub     = document.getElementById('loading-sub')     as HTMLParagraphElement;

function setLoadingProgress(pct: number, label?: string): void {
  loadingBarFill.style.width = `${pct}%`;
  loadingPct.textContent     = `${Math.round(pct)}%`;
  if (label) loadingSub.textContent = label;
}

function hideLoadingScreen(): void {
  if (!loadingScreen) return;
  loadingScreen.classList.add('hidden');
  loadingScreen.style.opacity = '0';
  loadingScreen.style.visibility = 'hidden';
  loadingScreen.style.pointerEvents = 'none';
  setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);
}

function withLoadTimeout(
  label: string,
  resolve: () => void,
  ms = 3500,
): () => void {
  let done = false;
  const timer = window.setTimeout(() => {
    if (done) return;
    done = true;
    console.warn(`[Assets] Timeout en ${label}, se omite para continuar.`);
    resolve();
  }, ms);

  return () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    resolve();
  };
}

// ════════════════════════════════════════════════════════════════════════════
// GameManager
// ════════════════════════════════════════════════════════════════════════════
export class GameManager {
  private renderer: THREE.WebGLRenderer;
  private camera:   THREE.PerspectiveCamera;
  private audio:    AudioManager;
  private metrics:  MetricsSystem;
  private clock:    THREE.Clock;

  private introScene?:      IntroScene;
  private gameScene?:       GameScene;
  private hyperspaceScene?: HyperspaceScene;
  private endingScene?:     EndingScene;

  private activeScene: 'intro' | 'game' | 'hyperspace' | 'ending' = 'intro';
  private animFrameId = 0;

  constructor() {
    // ── Renderer ──────────────────────────────────────────────────────────────
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias:       true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled   = false;

// ── Cámara ────────────────────────────────────────────────────────────────
    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 10000
    );
    this.camera.position.set(0, 7, 7);
    this.camera.lookAt(0, 6, 0);

    // ── Clock & sistemas ──────────────────────────────────────────────────────
    this.clock   = new THREE.Clock();
    this.audio   = new AudioManager(this.camera);
    this.metrics = new MetricsSystem(uuidv4());

    // ── Eventos globales ──────────────────────────────────────────────────────
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.activeScene === 'game') this.gameScene?.handleSpaceKey();
      }
    });
  }

  // ── Arranque público ───────────────────────────────────────────────────────
  async start(): Promise<void> {
    await Promise.race([
      this.preloadAssets(),
      new Promise<void>((resolve) => {
        window.setTimeout(() => {
          console.warn('[NOVA DRIVE] Precarga excedió tiempo límite, continuando.');
          resolve();
        }, 8000);
      }),
    ]);
    hideLoadingScreen();
    this.startIntro();
    this.loop();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRECARGA
  // ════════════════════════════════════════════════════════════════════════════
  private async preloadAssets(): Promise<void> {
    setLoadingProgress(0, 'Inicializando sistemas…');

    const total  = this.countAssets();
    let   loaded = 0;
    const tick   = (label: string) => {
      loaded++;
      setLoadingProgress((loaded / total) * 100, label);
    };

    await Promise.all([
      this.loadModels(tick),
      this.loadSkyboxes(tick),
      this.loadTextures(tick),
      this.loadAudio(tick),
    ]);

    setLoadingProgress(100, '¡Sistemas listos!');
    await new Promise<void>((r) => setTimeout(r, 400));
  }

  private countAssets(): number {
    const skyboxCount = 'skyboxes' in ASSET_PATHS
      ? Object.keys((ASSET_PATHS as any).skyboxes).length * 6
      : 0;
    return (
      Object.keys(ASSET_PATHS.models).length   +
      skyboxCount                               +
      Object.keys(ASSET_PATHS.textures).length  +
      Object.keys(ASSET_PATHS.audio).length
    );
  }

  // ── Modelos GLB ───────────────────────────────────────────────────────────
  private loadModels(tick: (l: string) => void): Promise<void[]> {
    const loader = new GLTFLoader();
    return Promise.all(
      Object.entries(ASSET_PATHS.models).map(([name, url]) =>
        new Promise<void>((resolve) => {
          const finish = withLoadTimeout(`modelo ${name}`, resolve);
          loader.load(
            url,
            () => { tick(`Modelo: ${name}`); finish(); },
            undefined,
            (err) => {
              console.warn(`[Assets] Modelo ${name} omitido.`, err);
              tick(`Modelo: ${name} (omitido)`);
              finish();
            },
          );
        }),
      ),
    );
  }

  // ── Skyboxes ──────────────────────────────────────────────────────────────
  private loadSkyboxes(tick: (l: string) => void): Promise<void[]> {
    if (!('skyboxes' in ASSET_PATHS)) return Promise.resolve([]);

    const loader  = new THREE.CubeTextureLoader();
    const faces   = ['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg'];
    const entries = Object.entries((ASSET_PATHS as any).skyboxes) as [string, string][];

    return Promise.all(
      entries.map(([zone, basePath]) =>
        new Promise<void>((resolve) => {
          const finish = withLoadTimeout(`skybox ${zone}`, resolve);
          loader.load(
            faces.map((f) => basePath + f),
            () => { faces.forEach(() => tick(`Skybox: ${zone}`)); finish(); },
            undefined,
            (err) => {
              console.warn(`[Assets] Skybox ${zone} omitido.`, err);
              faces.forEach(() => tick(`Skybox: ${zone} (omitido)`));
              finish();
            },
          );
        }),
      ),
    );
  }

  // ── Texturas ──────────────────────────────────────────────────────────────
  private loadTextures(tick: (l: string) => void): Promise<void[]> {
    const loader = new THREE.TextureLoader();
    return Promise.all(
      Object.entries(ASSET_PATHS.textures).map(([name, url]) =>
        new Promise<void>((resolve) => {
          const finish = withLoadTimeout(`textura ${name}`, resolve);
          loader.load(
            url,
            () => { tick(`Textura: ${name}`); finish(); },
            undefined,
            () => { tick(`Textura: ${name} (omitida)`); finish(); },
          );
        }),
      ),
    );
  }

  // ── Audio ─────────────────────────────────────────────────────────────────
  // Marca progreso por cada archivo y luego delega la carga real a AudioManager
  private async loadAudio(tick: (l: string) => void): Promise<void> {
    Object.keys(ASSET_PATHS.audio).forEach((name) => tick(`Audio: ${name}`));
    await this.audio.loadAll();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE ESCENAS
  // ════════════════════════════════════════════════════════════════════════════

  private startIntro(): void {
    this.activeScene = 'intro';
    this.introScene  = new IntroScene(
      this.renderer, this.camera, this.audio,
      () => this.startGame(),
    );
  }

private startGame(): void {
    this.introScene?.dispose();
    this.introScene  = undefined;
    this.activeScene = 'game';

    this.gameScene = new GameScene(
      this.renderer,
      this.camera,
      this.audio,
      { ...GAME_CONFIG, sessionId: (this.metrics as any)['sessionId'] } as any,
      this.metrics, // <--- AÑADE ESTA LÍNEA AQUÍ
      (newZone) => this.startHyperspace(newZone),
      ()        => this.startEnding(),
    );

    this.gameScene.setZone(Zone.EARTH);
  }

  private startHyperspace(toZone: Zone): void {
    this.gameScene?.pause();
    this.activeScene     = 'hyperspace';
    this.hyperspaceScene = new HyperspaceScene(this.renderer, this.camera);

    this.hyperspaceScene.play(toZone, () => {
      this.hyperspaceScene?.dispose();
      this.hyperspaceScene = undefined;
      this.gameScene?.setZone(toZone);
      this.gameScene?.resume();
      this.activeScene = 'game';
    });
  }

  private startEnding(): void {
    // GameScene no implementa dispose — solo desreferenciamos
    this.gameScene   = undefined;
    this.activeScene = 'ending';

    this.endingScene = new EndingScene(
      this.renderer, this.camera, this.metrics, this.audio,
      () => this.restart(),
    );
  }

  private restart(): void {
    this.endingScene?.dispose();
    this.endingScene = undefined;
    this.renderer.info.reset();
    this.metrics = new MetricsSystem(uuidv4());
    this.startIntro();
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ════════════════════════════════════════════════════════════════════════════
  private loop(): void {
    this.animFrameId = requestAnimationFrame(() => this.loop());
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const time  = this.clock.elapsedTime;

    switch (this.activeScene) {
      case 'intro':
        if (this.introScene) {
          this.introScene.update(delta);
          this.renderer.render(this.introScene.scene, this.camera);
        }
        break;
      case 'game':
        if (this.gameScene) {
          this.gameScene.update(delta, time);
          this.renderer.render(this.gameScene.scene, this.camera);
        }
        break;
      case 'hyperspace':
        if (this.hyperspaceScene) {
          this.hyperspaceScene.update(delta);
          this.renderer.render(this.hyperspaceScene.scene, this.camera);
        }
        break;
      case 'ending':
        if (this.endingScene) {
          this.endingScene.update(delta);
          this.renderer.render(this.endingScene.scene, this.camera);
        }
        break;
    }
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // ── Destrucción total ─────────────────────────────────────────────────────
  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.introScene?.dispose();
    this.hyperspaceScene?.dispose();
    this.endingScene?.dispose();
    this.renderer.dispose();
  }
}