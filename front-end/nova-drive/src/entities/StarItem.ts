import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import ParticleSystem from '../systems/ParticleSystem';
import ShieldEffect from '../systems/ShieldEffect';
import { assetUrl } from '../assetUrl';

export default class StarItem {
  public isExpired = false;
  public root = new THREE.Group();
  private model: THREE.Object3D | null = null;
  private loader = new GLTFLoader();
  private speed: number;
  private rotationSpeed = 1.5; // rad/s on Y
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene, speed = 12) {
    this.scene = scene;
    this.speed = speed;
    this.root.position.set(0, 0, -66);
    this.scene.add(this.root);
    this.load();
  }

  private load() {
    const url = assetUrl('/models/star_collectible.glb');
    this.loader.load(
      url,
      (gltf: any) => {
        this.model = gltf.scene as THREE.Object3D;
        this.normalizeModelSize(this.model, 2.4);
        // apply emissive-like appearance by adjusting material if present
        this.model.traverse((c) => {
          const m = (c as THREE.Mesh).material as any;
          if (m && 'emissive' in m) {
            m.emissive = new THREE.Color(0xffd700);
            m.emissiveIntensity = 0.8;
          }
        });
        this.root.add(this.model);
      },
      undefined,
      (err: any) => {
        console.warn('Failed to load star model', url, err);
        this.createFallbackStar();
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

  private createFallbackStar(): void {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshStandardMaterial({
        color: 0xffde59,
        emissive: 0x7c5f00,
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.3,
      }),
    );
    this.root.add(mesh);
    this.model = mesh;
  }

  update(delta: number): void {
    if (this.isExpired) return;
    // move toward the ship (increase Z)
    this.root.position.z += this.speed * delta;
    // rotate around Y
    this.root.rotation.y += this.rotationSpeed * delta;

    // expire if passed ship (z > 2)
    if (this.root.position.z > -4.5) {
      this.isExpired = true;
      try { this.scene.remove(this.root); } catch {}
    }
  }

  onCapture(particleSystem: ParticleSystem): void {
    if (this.isExpired) return;
    // animate orbiting to ship origin
    gsap.to(this.root.position, { x: 0, y: -0.9, z: -10.2, duration: 0.45, ease: 'power2.out' });
    gsap.to(this.root.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.45, ease: 'power2.in', onComplete: () => {
      this.isExpired = true;
      try { this.scene.remove(this.root); } catch {}
    }});

    // emit spark particles
    const worldPos = this.root.getWorldPosition(new THREE.Vector3());
    particleSystem.emit({
      position: worldPos,
      count: 24,
      texture: assetUrl('/textures/star.png'),
      color: 0xffd700,
      speed: 1.6,
      lifetime: 0.8,
      size: 0.12,
      spread: 1.4,
    });
  }

  onDeflect(shieldEffect: ShieldEffect, particleSystem: ParticleSystem): void {
    if (this.isExpired) return;
    const worldPos = this.root.getWorldPosition(new THREE.Vector3());
    shieldEffect.activate(worldPos);

    // Rebotar la estrella (Error de comisión)
    const dir = new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 2, 10 + Math.random() * 6);
    gsap.to(this.root.position, { x: this.root.position.x + dir.x, y: this.root.position.y + dir.y, z: this.root.position.z + dir.z, duration: 0.6, ease: 'power2.out', onComplete: () => {
      this.isExpired = true;
      try { this.scene.remove(this.root); } catch {}
    }});

    // Partículas de rechazo
    particleSystem.emit({
      position: worldPos,
      count: 20,
      texture: assetUrl('/textures/star.png'),
      color: 0xff4444, // Reflejo rojo o neutro para indicar error
      speed: 2,
      lifetime: 1.0,
      size: 0.14,
      spread: 1.8,
    });
  }

  isInFrustum(frustum: THREE.Frustum): boolean {
    if (!this.model) return false;
    try {
      return frustum.intersectsObject(this.root);
    } catch {
      return false;
    }
  }
}
