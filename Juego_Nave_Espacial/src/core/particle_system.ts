import { Scene, Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, AdditiveBlending, Vector3 } from 'three'

/**
 * Interfaz de configuración para ParticleSystem
 */
interface ParticleConfig {
  count: number      // Número de partículas
  color: number      // Color en hexadecimal
  size: number       // Tamaño de cada partícula
  speed: number      // Velocidad base
  lifetime: number   // Duración en frames
  spread: number     // Dispersión de direcciones (0-360)
}

/**
 * Clase ParticleSystem: Sistema de partículas para efectos visuales.
 * Crea explosiones, flashes de cañón y otros efectos luminosos
 * - Partículas se mueven en direcciones aleatorias con desvanecimiento
 * - Desaceleración gradual para efecto natural
 * - Se elimina automáticamente al término del lifetime
 */
export class ParticleSystem {
  // Objeto Points de Three.js para renderizar las partículas
  private readonly points: Points
  // Velocidades individuales de cada partícula
  private readonly velocities: Vector3[] = []
  // Edad del sistema en frames
  private frameAge = 0
  // Configuración del efecto
  private readonly config: ParticleConfig
  // Si el sistema está activo
  private active = true

  constructor(private readonly scene: Scene, position: Vector3, config: ParticleConfig) {
    this.config = config
    const positions = new Float32Array(config.count * 3)

    for (let i = 0; i < config.count; i++) {
      // Inicializar posiciones en el punto de origen
      positions[i * 3]     = position.x
      positions[i * 3 + 1] = position.y
      positions[i * 3 + 2] = position.z

      // Crear velocidad aleatoria en esfera
      this.velocities.push(new Vector3(
        (Math.random() - 0.5) * config.spread,
        (Math.random() - 0.5) * config.spread,
        (Math.random() - 0.5) * config.spread
      ).normalize().multiplyScalar(config.speed * (0.5 + Math.random())))
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

    const material = new PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      depthWrite: false,
    })

    this.points = new Points(geometry, material)
    this.scene.add(this.points)
  }

  /**
   * Actualiza el sistema de partículas
   * - Anima la opacidad (desvanecimiento)
   * - Mueve cada partícula según su velocidad
   * - Aplica desaceleración gradual
   * - Se destruye automáticamente al término del lifetime
   * @returns true si el sistema sigue activo
   */
  public update(): boolean {
    if (!this.active) return false

    this.frameAge++
    const progress = this.frameAge / this.config.lifetime  // progreso 0 → 1
    const positions = this.points.geometry.attributes.position.array as Float32Array
    const material = this.points.material as PointsMaterial

    // Desvanecer con el tiempo
    material.opacity = Math.max(0, 1 - progress)

    // Mover cada partícula según su velocidad
    for (let i = 0; i < this.config.count; i++) {
      positions[i * 3]     += this.velocities[i].x
      positions[i * 3 + 1] += this.velocities[i].y
      positions[i * 3 + 2] += this.velocities[i].z

      // Desacelerar gradualmente
      this.velocities[i].multiplyScalar(0.95)
    }

    this.points.geometry.attributes.position.needsUpdate = true

    if (this.frameAge >= this.config.lifetime) {
      this.destroy()
      return false
    }

    return true
  }

  /**
   * Destruye el sistema y libera recursos
   */
  private destroy(): void {
    this.active = false
    this.scene.remove(this.points)
    this.points.geometry.dispose()
    ;(this.points.material as PointsMaterial).dispose()
  }
}