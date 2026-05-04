/**
 * Clase Spaceship: Representa la nave del jugador.
 * 
 * Rediseño para prueba Go/No-Go:
 * - Carga del modelo 3D desde archivo GLB
 * - Movimiento automático hacia adelante (sin rotación lateral)
 * - Restricción de altura
 * - Animación sutil de feedback al responder correctamente
 * 
 * NOTA: Ya no dispara balas. La detección de respuesta se maneja en ResponseDetector.
 */

import { Object3D, Vector3 } from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Scene } from 'three/src/scenes/Scene.js'

export class Spaceship {
  // Cargador de modelos GLTF
  private readonly gltfLoader = new GLTFLoader()
  // Modelo 3D de la nave
  public declare model: Object3D
  // Velocidad de avance automático (puede activarse/desactivarse)
  private autoSpeed = 0.3
  // Parámetros de feedback visual
  private hitFeedbackActive = false
  private hitFeedbackTimer = 0

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
      console.log('[Spaceship] Modelo cargado exitosamente')
    }, undefined, () => {
      console.warn('[Spaceship] No se pudo cargar spaceship.glb, usando geometría procedimental')
      // Fallback: crear geometría procedimental si no carga GLB
      this.createProceduralModel()
    })
  }

  /**
   * Crea una nave procedimental si no está disponible el GLB
   */
  private createProceduralModel(): void {
    import('three').then(({ BoxGeometry, MeshStandardMaterial, Mesh }) => {
      const geometry = new BoxGeometry(1, 0.5, 2)
      const material = new MeshStandardMaterial({ color: 0x0088ff })
      this.model = new Mesh(geometry, material)
      this.model.position.set(0, 0, 0)
      this.scene.add(this.model)
      console.log('[Spaceship] Modelo procedimental creado')
    })
  }

  /**
   * Actualiza el estado de la nave cada frame:
   * - Movimiento automático hacia adelante (constante)
   * - Restricción de altura (y = 0)
   * - Feedback visual de respuesta correcta
   */
  public update(): void {
    if (!this.model) return

    // Movimiento automático hacia adelante
    this.model.position.z += this.autoSpeed
    // Restricción de altura (siempre en la línea central)
    this.model.position.y = 0

    // Actualizar feedback visual de hit
    if (this.hitFeedbackActive) {
      this.hitFeedbackTimer++
      if (this.hitFeedbackTimer > 10) {
        this.hitFeedbackActive = false
        this.hitFeedbackTimer = 0
      }
    }
  }

  /**
   * Ajusta la velocidad automática de avance de la nave.
   * Poner a 0 detiene el movimiento (útil durante pantallas de instrucción).
   */
  public setAutoSpeed(speed: number): void {
    this.autoSpeed = speed
  }

  /**
   * Activa feedback visual sutil cuando se registra una respuesta correcta (hit)
   * Produce un leve destello/brillo en la nave
   */
  public triggerHitFeedback(): void {
    this.hitFeedbackActive = true
    this.hitFeedbackTimer = 0
    
    // Animación sutil: pequeño aumento de escala
    if (this.model) {
      const originalScale = this.scale
      const targetScale = originalScale * 1.1
      
      // Animar escala hacia arriba y luego volver
      const startTime = Date.now()
      const duration = 200 // milisegundos
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease-out para animación más suave
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const currentScale = originalScale + (targetScale - originalScale) * easeProgress * 0.3
        
        this.model!.scale.set(currentScale, currentScale, currentScale)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.model!.scale.set(originalScale, originalScale, originalScale)
        }
      }
      
      animate()
    }

    console.log('[Spaceship] Feedback de hit activado')
  }

  /**
   * Obtiene la posición actual de la nave
   */
  public getPosition(): Vector3 {
    return this.model?.position.clone() || new Vector3(0, 0, 0)
  }
}