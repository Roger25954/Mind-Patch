import * as THREE from 'three';

export interface ParticleConfig {
  position: THREE.Vector3;
  count: number;
  texture: string;
  color: number;
  speed: number;
  lifetime: number; // seconds
  size: number;
  spread: number; // radians or units for randomness
}

interface ParticleSystemInstance {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  velocities: Float32Array; // x,y,z per particle
  capacity: number; // allocated particle count
  count: number; // active particle count
  age: number; // seconds since emit
  lifetime: number; // seconds
  initialSize: number;
}

export default class ParticleSystem {
  private scene: THREE.Scene;
  private loader = new THREE.TextureLoader();
  
  // 1. CAMBIO AQUÍ: Cambiamos el caché para guardar Promesas (evita el spam de peticiones)
  private texturePromises = new Map<string, Promise<THREE.Texture>>();
  
  private active: ParticleSystemInstance[] = [];
  private pool: ParticleSystemInstance[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // 2. CAMBIO AQUÍ: Reescribimos _getTexture para ser a prueba de balas
  private async _getTexture(path: string): Promise<THREE.Texture> {
    if (this.texturePromises.has(path)) {
      return this.texturePromises.get(path)!;
    }

    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      this.loader.load(
        path,
        (tex) => resolve(tex),
        undefined,
        (err) => reject(err)
      );
    });

    this.texturePromises.set(path, promise);
    return promise;
  }

  emit(config: ParticleConfig): void {
    const capacity = config.count;

    // ... (El bloque de reciclaje let instanceIndex = this.pool... se queda exactamente igual) ...
    let instanceIndex = this.pool.findIndex((p) => p.capacity >= capacity);
    let inst: ParticleSystemInstance | undefined;

    if (instanceIndex >= 0) {
      inst = this.pool.splice(instanceIndex, 1)[0];
      inst.count = config.count;
      inst.age = 0;
      inst.lifetime = config.lifetime;
      inst.initialSize = config.size;
      inst.material.color = new THREE.Color(config.color);
      inst.material.size = config.size;
      inst.material.needsUpdate = true;
    } else {
      // create new
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(capacity * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size: config.size,
        map: undefined,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: new THREE.Color(config.color),
      });
      const points = new THREE.Points(geometry, material);

      inst = {
        points,
        geometry,
        material,
        velocities: new Float32Array(capacity * 3),
        capacity,
        count: config.count,
        age: 0,
        lifetime: config.lifetime,
        initialSize: config.size,
      };
    }

    // Initialize positions and velocities
    const posAttr = inst.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const vel = inst.velocities;

    // 3. CAMBIO AQUÍ: ¡VITAL! Le decimos a Three.js exactamente cuántos vértices dibujar 
    // para evitar "partículas zombie" al reciclar del pool.
    inst.geometry.setDrawRange(0, config.count);

    for (let i = 0; i < config.count; i++) {
      const idx3 = i * 3;
      // start at given position
      positions[idx3 + 0] = config.position.x;
      positions[idx3 + 1] = config.position.y;
      positions[idx3 + 2] = config.position.z;

      // random direction inside sphere scaled by spread
      const dir = new THREE.Vector3(
        (Math.random() * 2 - 1),
        (Math.random() * 2 - 1),
        (Math.random() * 2 - 1)
      ).normalize();
      // apply spread randomness
      dir.x += (Math.random() - 0.5) * config.spread;
      dir.y += (Math.random() - 0.5) * config.spread;
      dir.z += (Math.random() - 0.5) * config.spread;
      dir.normalize();

      const speed = config.speed * (0.5 + Math.random() * 0.5);
      vel[idx3 + 0] = dir.x * speed;
      vel[idx3 + 1] = dir.y * speed;
      vel[idx3 + 2] = dir.z * speed;
    }

    posAttr.needsUpdate = true;

    // 4. CAMBIO AQUÍ: Aplicamos la textura y atrapamos posibles errores
    this._getTexture(config.texture).then((tex) => {
      inst!.material.map = tex;
      inst!.material.needsUpdate = true;
    }).catch(err => {
      console.warn(`[ParticleSystem] Falló la textura: ${config.texture}`, err);
    });

    // add to scene
    inst.points.frustumCulled = false;
    this.scene.add(inst.points);
    this.active.push(inst);
  }
  
  update(delta: number): void {
    // delta in seconds
    for (let i = this.active.length - 1; i >= 0; i--) {
      const inst = this.active[i];
      inst.age += delta;
      const t = inst.age / inst.lifetime;

      const posAttr = inst.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const vel = inst.velocities;

      for (let p = 0; p < inst.count; p++) {
        const idx3 = p * 3;
        positions[idx3 + 0] += vel[idx3 + 0] * delta;
        positions[idx3 + 1] += vel[idx3 + 1] * delta;
        positions[idx3 + 2] += vel[idx3 + 2] * delta;
      }

      posAttr.needsUpdate = true;

      // scale particles down over lifetime (uniform for system)
      const remaining = Math.max(0, 1 - t);
      inst.material.size = inst.initialSize * remaining;
      inst.material.opacity = remaining;
      inst.material.needsUpdate = true;

      if (inst.age >= inst.lifetime) {
        // remove from scene and pool it
        try {
          this.scene.remove(inst.points);
        } catch {}
        // reset some state
        inst.age = 0;
        inst.count = 0;
        this.active.splice(i, 1);
        this.pool.push(inst);
      }
    }
  }
}
