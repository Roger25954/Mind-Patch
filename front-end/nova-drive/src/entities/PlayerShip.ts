import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import ParticleSystem from '../systems/ParticleSystem';
import ShieldEffect from '../systems/ShieldEffect';



export default class PlayerShip {
  public isLoaded = false;
  public shieldEffect: ShieldEffect;

  private scene: THREE.Scene;
  private particleSystem: ParticleSystem;
  private loader = new GLTFLoader();
  private root = new THREE.Group();
  private thrustersOn = true;
  private thrusterAccumulator = 0;

private enginePositions: THREE.Vector3[] = [
    // Prueba con estos valores (empujamos la Z a 2.5 para que salgan del modelo)
    new THREE.Vector3(-0.9, -0.4, 3.5), // Motor izquierdo (SRB)
    new THREE.Vector3(0.9, -0.4, 3.5)   // Motor derecho (SRB)
  ];

  constructor(scene: THREE.Scene, particleSystem: ParticleSystem) {
    this.scene = scene;
    this.particleSystem = particleSystem;

    this.root.position.set(0, -1.2, -6.8);
    this.scene.add(this.root);

    this.shieldEffect = new ShieldEffect(scene, particleSystem);

    this.loadModel();

  }

  private loadModel() {
    const url = '/models/space_shuttle.glb';
    this.loader.load(
      url,
      (gltf: any) => {
        const model = gltf.scene as THREE.Object3D;
        this.normalizeModelSize(model, 12);
        model.position.set(0 , 0, 0);
        model.rotation.set(5,4.75,0);
        model.scale.set(0.4, 0.4, 0.4);
        this.root.add(model);
        this.isLoaded = true;
      }
    );
  }

  
  private normalizeModelSize(object: THREE.Object3D, targetSize: number): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxAxis) || maxAxis <= 0.0001) return;
    const scale = targetSize / maxAxis;
    object.scale.setScalar(scale);
  }

  getPosition(): THREE.Vector3 {
    return this.root.position;
  }

  addThrusterParticles(): void {
    this.thrustersOn = true;
  }

  stopThrusters(): void {
    this.thrustersOn = false;
  }

  shake(intensity: number): void {
    // Try to find a camera on the scene
    const cam = (this.scene as any).userData?.camera
      || this.scene.children.find((c) => (c as any).isCamera) as THREE.Camera | undefined;

    if (!cam) {
      console.warn('Camera not found on scene for shake');
      return;
    }

    const orig = cam.position.clone();
    const tl = gsap.timeline();
    tl.to(cam.position, { x: orig.x + (Math.random() - 0.5) * intensity, y: orig.y + (Math.random() - 0.5) * intensity, z: orig.z + (Math.random() - 0.5) * intensity, duration: 0.15, ease: 'power1.out' });
    tl.to(cam.position, { x: orig.x, y: orig.y, z: orig.z, duration: 0.15, ease: 'power1.in' });
  }

update(delta: number, time: number): void {
    // idle animation
    const yOffset = Math.sin(time) * 0.1;
    const zRot = THREE.MathUtils.degToRad(Math.sin(time) * 2);
    this.root.position.y = yOffset;
    this.root.rotation.z = zRot;

    // thruster particles continuous emission
    if (this.thrustersOn) {
      this.thrusterAccumulator += delta;
      const emitInterval = 0.03; 

      // 1. FORZAR ACTUALIZACIÓN DE MATRIZ: Nos aseguramos de tener la posición real de este frame
      this.root.updateMatrixWorld(true);

      while (this.thrusterAccumulator >= emitInterval) {
        this.thrusterAccumulator -= emitInterval;
        
        this.enginePositions.forEach(enginePos => {
          // Obtenemos la posición en el mundo base
          const basePos = enginePos.clone();
          basePos.applyMatrix4(this.root.matrixWorld);

          // 2. CLONAR AL EMITIR: Evitamos que las partículas compartan la misma referencia en memoria
          
          // Núcleo de la llama
          this.particleSystem.emit({
            position: basePos.clone(), // <--- ¡CLON AQUÍ!
            count: 3,
            texture: '/textures/glow.png', 
            color: 0xffdd44, 
            speed: 3.0,
            lifetime: 0.2,
            size: 0.15,
            spread: 0.1, 
          });

          // Borde de la llama
          this.particleSystem.emit({
            position: basePos.clone(), // <--- ¡Y CLON AQUÍ TAMBIÉN!
            count: 5,
            texture: '/textures/glow.png',
            color: 0xff4400, 
            speed: 2.0,
            lifetime: 0.4,
            size: 0.3,
            spread: 0.4, 
          });
        });
      }
    }

    // update shield effect timer if active
    this.shieldEffect.update(delta);
  }
}
