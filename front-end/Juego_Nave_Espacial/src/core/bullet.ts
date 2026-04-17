/**
 * Clase Bullet: Representa un proyectil disparado por la nave.
 * Características visuales:
 * - Núcleo blanco central iluminado
 * - Halo luminoso con color cian que pulsa
 * - Estela de partículas que se desvanece gradualmente
 */

import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three"

export class Bullet {
  // Generador de geometría para el núcleo
  private readonly root: Object3D
  // Malla del núcleo blanco central
  private readonly coreMesh: Mesh
  // Sprite del halo luminoso (billboard que siempre mira a cámara)
  private readonly glowSprite: Sprite
  // Puntos de la estela
  private readonly trail: Points
  // Posiciones de los puntos de la estela
  private readonly trailPositions: number[]
  // Colores de los puntos de la estela
  private readonly trailColors: number[]
  // Longitud máxima de la estela
  private readonly MAX_TRAIL = 24
  // Velocidad de movimiento
  private readonly speed = 2
  // Dirección de disparo
  readonly direction: Vector3
  // Color base del proyectil
  private readonly COLOR = new Color(0x00ffff)
  // Obstáculo objetivo para rastreo (homing)
  private targetObstacle: any = null
  // Factor de suavidad para rastreo (0-1): qué tan rápido ajusta la dirección
  private readonly TRACKING_SMOOTHNESS = 0.12

  constructor(
    private readonly scene: Scene,
    position: Vector3,
    direction: Vector3,
    targetObstacle: any = null
  ) {
    this.direction = direction.clone().normalize()
    this.targetObstacle = targetObstacle
    this.root = new Object3D()
    this.root.position.copy(position)
    this.scene.add(this.root)

    // ── 1. NÚCLEO ──────────────────────────────────────────────
    const coreGeo = new SphereGeometry(0.12, 12, 12)
    const coreMat = new MeshBasicMaterial({
      color: new Color(1, 1, 1), // blanco puro en el centro
      blending: AdditiveBlending,
      depthWrite: false,
    })
    this.coreMesh = new Mesh(coreGeo, coreMat)
    this.root.add(this.coreMesh)

    // ── 2. HALO / GLOW (sprite billboard) ──────────────────────
    const glowMat = new SpriteMaterial({
      color: this.COLOR,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.85,
      map: Bullet.createGlowTexture(),
    })
    this.glowSprite = new Sprite(glowMat)
    this.glowSprite.scale.setScalar(1.2)
    this.root.add(this.glowSprite)

    // ── 3. TRAIL (estela de partículas) ────────────────────────
    this.trailPositions = new Array(this.MAX_TRAIL * 3).fill(0)
    this.trailColors = new Array(this.MAX_TRAIL * 3).fill(0)

    const trailGeo = new BufferGeometry()
    trailGeo.setAttribute(
      "position",
      new Float32BufferAttribute(this.trailPositions, 3)
    )
    trailGeo.setAttribute(
      "color",
      new Float32BufferAttribute(this.trailColors, 3)
    )

    const trailMat = new PointsMaterial({
      size: 0.18,
      vertexColors: true,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      sizeAttenuation: true,
    })

    this.trail = new Points(trailGeo, trailMat)
    this.scene.add(this.trail)
  }

  /**
   * Genera una textura radial suave para el efecto glow (halo)
   * @returns Textura con gradiente radial cian
   */
  private static createGlowTexture(): Texture {
    const size = 128
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size
    const ctx = canvas.getContext("2d")!
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    )
    gradient.addColorStop(0, "rgba(255,255,255,1)")
    gradient.addColorStop(0.2, "rgba(0,255,255,0.8)")
    gradient.addColorStop(0.6, "rgba(0,255,255,0.2)")
    gradient.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const tex = new Texture(canvas)
    tex.needsUpdate = true
    return tex
  }

  /**
   * Actualiza la posición y efectos visuales del proyectil:
   * - Rastrea el objetivo si existe (homing)
   * - Mueve el proyectil en su dirección
   * - Anima el pulso del halo
   * - Actualiza la estela de partículas con desvanecimiento
   */
  public update(): void {
    // Si hay objetivo, ajustar dirección hacia él con suavidad
    if (this.targetObstacle && this.targetObstacle.getPosition) {
      const targetPos = this.targetObstacle.getPosition()
      const toTarget = targetPos.clone().sub(this.root.position).normalize()
      // Interpolación suave (lerp) para evitar giros erráticos
      this.direction.lerp(toTarget, this.TRACKING_SMOOTHNESS)
    }

    // Mueve el proyectil
    this.root.position.addScaledVector(this.direction, this.speed)

    // Pulso en el glow (parpadeo energético)
    const pulse = 1 + 0.25 * Math.sin(performance.now() * 0.025)
    this.glowSprite.scale.setScalar(1.2 * pulse)

    // Actualiza la estela: desplaza hacia atrás en world-space
    const pos = this.root.position
    const posArr = this.trail.geometry.attributes.position
      .array as Float32Array
    const colArr = this.trail.geometry.attributes.color
      .array as Float32Array

    // Desplaza puntos existentes
    for (let i = this.MAX_TRAIL - 1; i > 0; i--) {
      posArr[i * 3] = posArr[(i - 1) * 3]
      posArr[i * 3 + 1] = posArr[(i - 1) * 3 + 1]
      posArr[i * 3 + 2] = posArr[(i - 1) * 3 + 2]
    }
    // Nuevo punto en la cabeza
    posArr[0] = pos.x
    posArr[1] = pos.y
    posArr[2] = pos.z

    // Color con fade: brillante al inicio → negro al final
    for (let i = 0; i < this.MAX_TRAIL; i++) {
      const t = 1 - i / this.MAX_TRAIL // 1 → 0
      const fade = t * t
      colArr[i * 3] = this.COLOR.r * fade
      colArr[i * 3 + 1] = this.COLOR.g * fade
      colArr[i * 3 + 2] = this.COLOR.b * fade
    }

    ;(this.trail.geometry.attributes.position as any).needsUpdate = true
    ;(this.trail.geometry.attributes.color as any).needsUpdate = true
  }

  /**
   * Retorna la posición actual del proyectil
   * @returns Vector3 con la posición
   */
  public getPosition(): Vector3 {
    return this.root.position
  }

  /**
   * Destruye el proyectil y libera recursos
   */
  public destroy(): void {
    this.scene.remove(this.root)
    this.scene.remove(this.trail)
    this.coreMesh.geometry.dispose()
    this.trail.geometry.dispose()
  }
}