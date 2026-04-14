/**
 * Clase Spaceship: Representa la nave del jugador.
 * Gestiona:
 * - Carga del modelo 3D desde archivo GLB
 * - Movimiento automático hacia adelante y restricción de altura
 * - Generación y actualización de balas disparadas
 * - Sistema de enfriamiento (cooldown) entre disparos
 */

import { Object3D, Vector3 } from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Scene } from 'three/src/scenes/Scene.js'
import { Bullet } from './bullet'

export class Spaceship {
  // Cargador de modelos GLTF
  private readonly gltfLoader = new GLTFLoader()
  // Modelo 3D de la nave
  public declare model: Object3D
  // Velocidad de avance automático
  private readonly autoSpeed = 0.3
  // Array de balas activas
  private bullets: Bullet[] = []
  // Cooldown actual entre disparos
  private shootCooldown = 0
  // Tasa de disparo (frames entre disparos)
  private readonly shootRate = 10

  constructor(
    private readonly scene: Scene,
    private readonly scale: number
  ) {}

  /**
   * Carga el modelo 3D de la nave desde archivo GLB externo
   */
  public loadModel(): void {
    this.gltfLoader.load('/spaceship.glb', (gltf: GLTF) => {
      this.model = gltf.scene
      this.model.scale.set(this.scale, this.scale, this.scale)
      this.model.position.set(0, 0, 0)
      this.scene.add(this.model)
    })
  }

  /**
   * Dispara una bala en la dirección especificada
   * Respeta el cooldown entre disparos
   * @param direction - Dirección de disparo (será normalizada)
   * @param targetObstacle - Obstáculo objetivo opcional para rastreo (homing)
   */
  public shootToward(direction: Vector3, targetObstacle: any = null): void {
    if (this.shootCooldown > 0) return
    const position = this.model.position.clone()
    const bullet = new Bullet(this.scene, position, direction.normalize(), targetObstacle)
    this.bullets.push(bullet)
    this.shootCooldown = this.shootRate
  }

  /**
   * Actualiza el estado de la nave cada frame:
   * - Movimiento automático hacia adelante
   * - Actualización del cooldown
   * - Actualización y limpieza de balas distantes
   */
  public update(): void {
    if (!this.model) return

    // Movimiento automático hacia adelante
    this.model.position.z += this.autoSpeed
    this.model.position.y = 0

    if (this.shootCooldown > 0) this.shootCooldown--

    this.bullets = this.bullets.filter(bullet => {
      bullet.update()
      if (bullet.getPosition().distanceTo(this.model.position) > 300) {
        bullet.destroy()
        return false
      }
      return true
    })
  }

  /**
   * Retorna el array de balas activas
   * @returns Array de balas
   */
  public getBullets(): Bullet[] {
    return this.bullets
  }

  /**
   * Remueve una bala específica del array
   * @param bullet - Bala a remover
   */
  public removeBullet(bullet: Bullet): void {
    bullet.destroy()
    this.bullets = this.bullets.filter(b => b !== bullet)
  }
}