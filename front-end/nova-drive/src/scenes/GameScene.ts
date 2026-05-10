import * as THREE from 'three';
import PlayerShip from '../entities/PlayerShip';
import SpawnSystem from '../systems/SpawnSystem';
import RadarSystem from '../systems/RadarSystem';
import EnergySystem from '../systems/EnergySystem';
import MetricsSystem from '../systems/MetricsSystem';
import ParticleSystem from '../systems/ParticleSystem';
import HUD from '../ui/HUD';
import PromptOverlay from '../ui/PromptOverlay';
import AudioManager from '../systems/AudioManager';
import { ItemType, Zone, TrialOutcome } from '../types';
import type { GameConfig } from '../types';
import StarItem from '../entities/StarItem';
import DebrisItem from '../entities/DebrisItem';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type OnZoneComplete = (zone: Zone) => void;
type OnGameComplete = () => void;

// ── Type guards ────────────────────────────────────────────────────────────────
function isStar(item: StarItem | DebrisItem): item is StarItem {
  return item instanceof StarItem;
}

function isDebris(item: StarItem | DebrisItem): item is DebrisItem {
  return item instanceof DebrisItem;
}
// ──────────────────────────────────────────────────────────────────────────────

export default class GameScene {
  public scene: THREE.Scene;
  private camera: THREE.Camera;
  private audioManager: AudioManager;
  private config: GameConfig;

  private player: PlayerShip;
  private spawn: SpawnSystem;
  private radar: RadarSystem;
  private energy: EnergySystem;
  private metrics: MetricsSystem;
  private particles: ParticleSystem;
  private hud: HUD;
  private prompt: PromptOverlay;

  private activeItems: Array<{ item: StarItem | DebrisItem; trialIndex: number }> = [];
  private trialTimeouts = new Map<number, number>();
  private currentPrompt: { trialIndex: number; expiresAt: number } | null = null;

  private onZoneComplete: OnZoneComplete | null = null;
  private onGameComplete: OnGameComplete | null = null;
  
  private currentActiveZone: Zone = Zone.EARTH; // Nuestro nuevo controlador

  private gltfLoader = new GLTFLoader();
  private currentPlanetModel: THREE.Group | null = null;
// 1. Modifica los parámetros del constructor
constructor(
    camera: THREE.Camera,
    audioManager: AudioManager,
    config: GameConfig,
    metrics: MetricsSystem, 
    onZoneComplete?: OnZoneComplete,
    onGameComplete?: OnGameComplete
  ) {
    this.camera = camera;
    this.audioManager = audioManager;
    this.config = config;
    this.onZoneComplete = onZoneComplete ?? null;
    this.onGameComplete = onGameComplete ?? null;

    this.scene = new THREE.Scene();
    this.configureCamera();

    // ── Sistemas ───────────────────────────────────────────────────────────────
    this.particles = new ParticleSystem(this.scene);
    this.hud       = new HUD();
    this.prompt    = new PromptOverlay();
    this.spawn     = new SpawnSystem(this.scene, this.config);
    this.radar     = new RadarSystem(document.body);
    this.energy    = new EnergySystem(this.config, this.hud);
    
    // 2. Reemplaza la línea del "new MetricsSystem" por esta:
    this.metrics   = metrics; 
    
    this.player    = new PlayerShip(this.scene, this.particles);
    
    // ── Iluminación ────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x111133, 0.3);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);

    const point = new THREE.PointLight(0x4fc3f7, 0.5, 30);
    this.scene.add(point);

// ── Eventos ────────────────────────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleSpaceKey();
      }
    });

    // ── Arrancar spawn ─────────────────────────────────────────────────────────
    this.spawn.start((item, trialIndex) => this.onSpawn(item, trialIndex));
  }

private configureCamera(): void {
    const cam = this.camera as THREE.PerspectiveCamera;
    if (!cam || !('isPerspectiveCamera' in cam)) return;
    
    cam.fov = 60;   // Zoom óptimo
    cam.near = 0.1;
    cam.far = 10000;
    
    // Forzamos la posición cercana a la nave
    cam.position.set(0, 7, 7 );
    cam.lookAt(0, 6, 0);
    cam.updateProjectionMatrix();
    
    // Keep camera accessible for systems that need camera shake.
    this.scene.userData.camera = cam;
  }
private onSpawn(item: StarItem | DebrisItem, trialIndex: number): void {
    const zone = this.currentActiveZone; // Usamos la variable nueva
    const type = isStar(item) ? ItemType.STAR : ItemType.DEBRIS;
    this.metrics.startTrial(trialIndex, type, zone);

    this.activeItems.push({ item, trialIndex });

    if (isStar(item)) {
      this.prompt.showStarPrompt();
    } else {
      this.prompt.showDebrisPrompt();
    }

    const expiresAt = performance.now() + this.config.stimulusWindowMs;
    this.currentPrompt = { trialIndex, expiresAt };

    const tId = window.setTimeout(() => {
      const existing = this.activeItems.find((a) => a.trialIndex === trialIndex);
      if (existing) {
        if (isStar(existing.item)) {
          // NO-GO Exitoso
          this.metrics.recordOutcome(trialIndex, TrialOutcome.CORRECT_REJECTION);
          existing.item.onCapture(this.particles);
          this.energy.addEnergy(); // Lo dejamos solo para efecto visual en la barra
          this.audioManager.playSFX('sfx_star_collect');
        } else {
          // GO Fallido
          this.metrics.recordOutcome(trialIndex, TrialOutcome.MISS);
          (existing.item as DebrisItem).onImpact(this.particles);
          this.audioManager.playSFX('sfx_warning');
          this.triggerImpactEffect(); 
        }
        this.prompt.hide();
        this.removeActiveItem(trialIndex);
        this.hud.updateTrial(this.spawn.currentTrialIndex, this.config.totalTrials);
        
        // 🔥 Llama a la comprobación de niveles (25%, 50%, 75%)
        this.checkLevelProgress();
      }
      this.currentPrompt = null;
      this.trialTimeouts.delete(trialIndex);
    }, this.config.stimulusWindowMs);

    this.trialTimeouts.set(trialIndex, tId);
  }

  //logica del teclado espacio para interactuar con los items
 public handleSpaceKey(): void {
    const now = performance.now();

    // 1. Si presionó espacio pero no hay nada activo en pantalla
    if (!this.currentPrompt) {
      this.metrics.recordCommissionError();
      this.audioManager.playSFX('sfx_warning');
      return;
    }

    const { trialIndex } = this.currentPrompt;
    
    // 2. Buscamos el ítem EXACTO que le toca a este turno (sin usar frustum)
    const activeEntry = this.activeItems.find((a) => a.trialIndex === trialIndex);

    // Función para apagar el temporizador y que no te marque error después
    const clearTimer = () => {
      const t = this.trialTimeouts.get(trialIndex);
      if (t) { clearTimeout(t); this.trialTimeouts.delete(trialIndex); }
    };

    if (activeEntry) {
      // ── CASO A (GO EXITOSO): Presionó espacio frente a un ASTEROIDE ──
      if (isDebris(activeEntry.item)) {
        const debris = activeEntry.item as DebrisItem;
        
        // 🔥 ¡AQUÍ ESTÁ LA MAGIA! Dispara el escudo y empuja el asteroide
        if (this.player.shieldEffect) {
          debris.onDeflect(this.player.shieldEffect, this.particles);
        }
        
        this.metrics.recordResponse(trialIndex, now);
        this.metrics.recordOutcome(trialIndex, TrialOutcome.HIT); 
        this.audioManager.playSFX('sfx_shield_activate');
      } 
      // ── CASO B (NO-GO FALLIDO): Presionó espacio frente a una ESTRELLA ──
      else {
        const star = activeEntry.item as StarItem; 
        
        // Repele la estrella porque cometió un error
        if (star.onDeflect && this.player.shieldEffect) {
          star.onDeflect(this.player.shieldEffect, this.particles);
        }
        
        this.metrics.recordResponse(trialIndex, now);
        this.metrics.recordCommissionError(); // Error por impulsividad
        this.audioManager.playSFX('sfx_shield_activate'); 
      }

      // Limpiamos la pantalla y avanzamos
      this.prompt.hide();
      clearTimer();
      this.removeActiveItem(trialIndex);
      this.hud.updateTrial(this.spawn.currentTrialIndex, this.config.totalTrials);
      
      // Apagamos el prompt actual para evitar dobles pulsaciones
      this.currentPrompt = null; 
      return;
    }

    // Si llegó hasta aquí, algo falló y marcamos error
    this.metrics.recordCommissionError();
    this.audioManager.playSFX('sfx_warning');
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  private removeActiveItem(trialIndex: number): void {
    const idx = this.activeItems.findIndex((a) => a.trialIndex === trialIndex);
    if (idx >= 0) this.activeItems.splice(idx, 1);
  }

  // ── Cambio de zona ──────────────────────────────────────────────────────────
  setZone(zone: Zone): void {
    const zoneCfg = this.config.zones.find((z) => z.name === zone);
    if (!zoneCfg) return;


  // Skybox
    try {
      const loader = new THREE.CubeTextureLoader();
      const urls = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']
        .map((f) => zoneCfg.skybox + f);
      
      // Aseguramos de quitar cualquier color sólido previo
      this.scene.background = null; 
      
      loader.load(urls, (texture) => {
        // Solo lo aplicamos cuando ya cargó con éxito
        this.scene.background = texture;
      });
    } catch (e) {
      console.warn('Failed to load skybox for', zone, e);
    }

    // BGM
    const bgmKey = zoneCfg.bgm.replace('/audio/', '').replace('.ogg', '');
    this.audioManager.playBGM(bgmKey);

    // HUD
    this.hud.updateZone(zone);

    // Cargar Planeta
    const planetPath = (zoneCfg as any).planet; 
    if (planetPath) {
      if (this.currentPlanetModel) {
        this.scene.remove(this.currentPlanetModel);
      }

      this.gltfLoader.load(planetPath, (gltf) => {
        this.currentPlanetModel = gltf.scene;
        
        // 🚀 Lógica de escalas personalizadas por planeta
        if (zone === Zone.EARTH) {
          // La Tierra (con Sol/Luna) se reduce al máximo
          this.currentPlanetModel.scale.set(0.5, 0.5, 0.5); 
          this.currentPlanetModel.position.set(20, -10, -100); 
        } 
        else if (zone === Zone.MARS) {
          // Ajustamos Marte para que no estorbe (escala 5 en lugar de 30)
          this.currentPlanetModel.scale.set(0.5, 0.5, 0.5); 
          this.currentPlanetModel.position.set(25, -12, -120); 
        }
        else {
          // Luna y Júpiter mantienen el tamaño épico estándar
          this.currentPlanetModel.scale.set(30, 30, 30); 
          this.currentPlanetModel.position.set(20, -10, -150); 
        }

        this.scene.add(this.currentPlanetModel);
      }, undefined, (error) => {
        console.error("Error cargando el planeta:", error);
      });
    }
  }

  // ── Pausa / reanuda (para HyperspaceScene) ──────────────────────────────────
  pause(): void  { this.spawn.pause(); }
  resume(): void { this.spawn.resume(); }

  private triggerImpactEffect(): void {
    // 1. Guardamos la posición original de la cámara
    const origX = this.camera.position.x;
    const origY = this.camera.position.y;

    // 2. Camera Shake usando GSAP
    gsap.to(this.camera.position, {
      x: origX + 0.3,
      y: origY - 0.3,
      yoyo: true,
      repeat: 5,        // Se sacude 5 veces
      duration: 0.05,   // Súper rápido
      ease: "rough({ template: power0, strength: 1, points: 20, taper: 'none', randomize: true })",
      onComplete: () => {
        // Asegurarnos de que la cámara regrese exactamente a su lugar
        this.camera.position.set(origX, origY, this.camera.position.z);
      }
    });

    // 3. Le decimos a la nave que suelte chispas y cabecee
    // (Asegúrate de haber puesto la función takeDamage en PlayerShip.ts como vimos antes)
    this.player.takeDamage(this.particles);
  }

 // ── 🚀 Verificador de progreso por ítems ────────────────────────────────────
  private checkLevelProgress(): void {
    // 1. ¡PRIORIDAD MÁXIMA! Revisar si el juego terminó.
    // El juego acaba si estamos en el último turno (o mayor) Y ya no quedan ítems activos en pantalla.
    const isLastTrial = this.spawn.currentTrialIndex >= this.config.totalTrials - 1;
    const isScreenClear = this.activeItems.length === 0;

    if (isLastTrial && isScreenClear) {
      // Ocultar el HUD visual y los avisos para que la pantalla de métricas se vea limpia
      const hudElement = document.getElementById('hud');
      if (hudElement) hudElement.style.display = 'none';

      const promptElement = document.getElementById('prompt');
      if (promptElement) promptElement.style.display = 'none';

      // 💥 Disparamos el final (Llama a GameManager -> EndingScene)
      if (this.onGameComplete) this.onGameComplete();
      return; 
    }

    // 2. Si el juego sigue, calculamos el porcentaje de avance (ej. 75 de 100 = 0.75)
    const progress = this.spawn.currentTrialIndex / this.config.totalTrials;

    // 3. Buscamos qué zona nos toca según este porcentaje
    let targetZone = this.config.zones[0].name;
    for (const zoneCfg of this.config.zones) {
      if (progress >= zoneCfg.threshold) {
        targetZone = zoneCfg.name;
      }
    }

    // 4. Si la zona que nos toca es diferente a la actual, ¡Viajamos!
    if (targetZone !== this.currentActiveZone) {
      this.currentActiveZone = targetZone;
      if (this.onZoneComplete) this.onZoneComplete(targetZone);
    }
  }

  // ── Game loop ───────────────────────────────────────────────────────────────
  update(delta: number, time: number): void {
    this.player.update(delta, time);
    this.particles.update(delta);

    for (let i = this.activeItems.length - 1; i >= 0; i--) {
      const entry = this.activeItems[i];
      entry.item.update(delta);
      if (entry.item.isExpired) {
        this.activeItems.splice(i, 1);
      } else {
        this.radar.updateItem(entry.item, this.camera);
      }
    }

    this.radar.update(delta);
    this.hud.updateEnergy(this.energy.energyPercent);

    // Actualizar PointLight en posición de la nave
    const point = this.scene.children.find(
      (c): c is THREE.PointLight => c instanceof THREE.PointLight
    );
    if (point) {
      const shipPos = this.player.getPosition();
      if (shipPos) point.position.copy(shipPos);
    }
  }
}