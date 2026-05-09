import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import ParticleSystem from '../systems/ParticleSystem';
import ShieldEffect from '../systems/ShieldEffect';

export default class DebrisItem {
  public isExpired = false;
  public root = new THREE.Group();
  private model: THREE.Object3D | null = null;
  private loader = new GLTFLoader();
  private speed: number;
  private rotSpeed = new THREE.Vector3();
  private scene: THREE.Scene;

  private static ASTEROID_MODELS = [
    '/models/asteroid_1.glb',
    '/models/asteroid_2.glb',
  ];

constructor(scene: THREE.Scene, reactionTimeMs = 2000) {
    this.scene = scene;
    
    // 1. Posicionarlo a lo lejos
    this.root.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5, -68);
    this.scene.add(this.root);
    
    // 2. Calcular la velocidad exacta de impacto (Distancia total: 63.5 unidades)
    const distanceToTravel = Math.abs(-68 - (-4.5)); 
    const timeInSeconds = reactionTimeMs / 1000;
    this.speed = distanceToTravel / timeInSeconds;

    // 3. Darle una rotación mucho más rápida y caótica para mayor realismo
    this.rotSpeed.set(
      (Math.random() - 0.5) * 6, 
      (Math.random() - 0.5) * 6, 
      (Math.random() - 0.5) * 6
    );
    
    this.load();
  }

  private load() {
    const choice = DebrisItem.ASTEROID_MODELS[Math.floor(Math.random() * DebrisItem.ASTEROID_MODELS.length)];
    this.loader.load(
      choice,
      (gltf: any) => {
        this.model = gltf.scene as THREE.Object3D;
        this.normalizeModelSize(this.model, 2.8);
        // apply basic material fallback if needed
        this.root.add(this.model);
      },
      undefined,
      (err: any) => {
        console.warn('Failed to load debris model', choice, err);
        this.createFallbackDebris();
      }
    );
  }

  private normalizeModelSize(object: THREE.Object3D, targetSize: number): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxAxis) || maxAxis <= 0.0001) return;
    object.scale.setScalar(targetSize / maxAxis);
  }

  private createFallbackDebris(): void {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.1, 0),
      new THREE.MeshStandardMaterial({
        color: 0xa4a7ad,
        roughness: 0.9,
        metalness: 0.05,
      }),
    );
    this.root.add(mesh);
    this.model = mesh;
  }

  update(delta: number): void {
    if (this.isExpired) return;
    // move toward ship
    this.root.position.z += this.speed * delta;
    // tumble
    this.root.rotation.x += this.rotSpeed.x * delta;
    this.root.rotation.y += this.rotSpeed.y * delta;
    this.root.rotation.z += this.rotSpeed.z * delta;
  }

  onDeflect(shieldEffect: ShieldEffect, particleSystem: ParticleSystem): void {
    if (this.isExpired) return;
    const worldPos = this.root.getWorldPosition(new THREE.Vector3());
    shieldEffect.activate(worldPos);

    // bounce away in random direction
    const dir = new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 2, 10 + Math.random() * 6);
    gsap.to(this.root.position, { x: this.root.position.x + dir.x, y: this.root.position.y + dir.y, z: this.root.position.z + dir.z, duration: 0.6, ease: 'power2.out', onComplete: () => {
      this.isExpired = true;
      try { this.scene.remove(this.root); } catch {}
    }});

    particleSystem.emit({
      position: worldPos,
      count: 20,
      texture: '/textures/debris.png',
      color: 0xcccccc,
      speed: 2,
      lifetime: 1.0,
      size: 0.14,
      spread: 1.8,
    });
  }

onImpact(particleSystem: ParticleSystem): void {
    if (this.isExpired) return;
    const worldPos = this.root.getWorldPosition(new THREE.Vector3());
    
    particleSystem.emit({
      position: worldPos,
      count: 28,
      texture: '/textures/debris.png',
      color: 0xff4444,
      speed: 2.4,
      lifetime: 1.2,
      size: 0.16,
      spread: 2.0,
    });

    // 🔥 LA OPTIMIZACIÓN AQUÍ 🔥
    this.isExpired = true;
    this.root.visible = false; // 1. Lo desaparecemos instantáneamente de la pantalla
    
    // 2. Si sigue existiendo en el mundo 3D, lo eliminamos de forma segura sin usar try/catch
    if (this.root.parent) {
      this.scene.remove(this.root); 
    }
  }
}
