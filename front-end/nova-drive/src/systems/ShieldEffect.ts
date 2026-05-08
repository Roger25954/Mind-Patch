import * as THREE from 'three';
import gsap from 'gsap';
import ParticleSystem from './ParticleSystem';
import type { ParticleConfig } from './ParticleSystem';

export default class ShieldEffect {
  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private shieldMesh: THREE.Mesh;
  private _isActive = false;
  private elapsed = 0;
  private duration = 0.6; // seconds
  private timeoutId: number | null = null;

  constructor(scene: THREE.Scene, particleSystem: ParticleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;

    const geom = new THREE.SphereGeometry(2.5, 32, 32);
   const mat = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0,
      wireframe: false,
      side: THREE.DoubleSide,
      depthWrite: false,               // <--- CRUCIAL: Evita que se dibuje detrás del fondo
      blending: THREE.AdditiveBlending // <--- CRUCIAL: Lo hace brillar como luz real
    });
    this.shieldMesh = new THREE.Mesh(geom, mat);
    this.shieldMesh.visible = false;
    this.shieldMesh.scale.set(1, 1, 1);
    this.scene.add(this.shieldMesh);
  }

  get isActive(): boolean {
    return this._isActive;
  }

  activate(position: THREE.Vector3): void {
    // 1. Limpiar animaciones previas por si presionas espacio muy rápido
    gsap.killTweensOf(this.shieldMesh.material);
    gsap.killTweensOf(this.shieldMesh.scale);

    this.shieldMesh.position.copy(position);
    this.shieldMesh.visible = true;
    this._isActive = true;
    this.elapsed = 0;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // 2. Hacerlo más grande de inicio para que destaque
    this.shieldMesh.scale.set(1.0, 1.0, 1.0);
    const material = this.shieldMesh.material as THREE.MeshBasicMaterial;
    material.opacity = 0;

    const tl = gsap.timeline();
    // 3. Subimos la opacidad máxima a 0.8 (el doble que antes)
    tl.to(material, { opacity: 0.8, duration: 0.1 });
    // Y nos aseguramos de volver a esconderlo al terminar
    tl.to(material, { opacity: 0, duration: 0.4, onComplete: () => {
       this.shieldMesh.visible = false; 
    }});

    // Efecto de explosión del escudo un poco más grande
    tl.to(this.shieldMesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.15, ease: 'power1.out' }, 0);
    tl.to(this.shieldMesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.15, ease: 'power1.in' }, 0.15);

    // Emitir partículas
    const cfg: ParticleConfig = {
      position: position.clone(),
      count: 32,
      texture: '/textures/glow.png',
      color: 0x4fc3f7,
      speed: 1.5,
      lifetime: this.duration,
      size: 0.25,
      spread: 1.2,
    };
    this.particleSystem.emit(cfg);

    // auto-deactivate after duration
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
    }, this.duration * 1000);
  }
  
  private deactivate(): void {
    this._isActive = false;
    this.shieldMesh.visible = false;
    this.elapsed = 0;
    // reset visual state
    this.shieldMesh.scale.set(1, 1, 1);
    (this.shieldMesh.material as THREE.MeshBasicMaterial).opacity = 0;
  }

  update(delta: number): void {
    if (!this._isActive) return;
    this.elapsed += delta;
    if (this.elapsed >= this.duration) {
      this.deactivate();
    }
  }
}
