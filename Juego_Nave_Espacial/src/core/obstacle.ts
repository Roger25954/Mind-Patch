import { Scene, Vector3, Object3D, Mesh, SphereGeometry, BoxGeometry, MeshStandardMaterial } from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/Addons.js'

/**
 * Clase Obstacle: Representa un obstáculo (meteorito) en el juego.
 * Funcionalidades:
 * - Carga de modelo 3D desde archivo GLB
 * - Movimiento hacia la nave con velocidad y escala aleatoria
 * - Rotación continua en los tres ejes
 * - Detección para raycasting (referencias userData)
 */

export enum ObstacleType {
  Star = 'star',
  Trash = 'trash',
  Dog = 'dog'
}

export class Obstacle {
  // Modelo 3D del obstáculo (cargado asíncronamente desde GLB)
  private _model: Object3D | null = null
  // Velocidad de movimiento hacia atrás (eje Z)
  private readonly speed: number
  // Factor de escala del modelo
  private readonly _scale: number
  // Posición actual en el mundo
  private _position: Vector3
  // Tipo de obstáculo
  public readonly type: ObstacleType
  // Tiempo de vida en frames
  private lifetime: number = 0
  private readonly maxLifetime: number = 30 // ~0.5s at 60fps
  // Tiempo de spawn para calcular reacción
  private readonly spawnTime: number

  get model(): Object3D | null {
    return this._model
  }

  constructor(
    private readonly scene: Scene,
    spawnPosition: Vector3,
    type: ObstacleType = ObstacleType.Trash
  ) {
    this.type = type
    this.speed = 0.25 + Math.random() * 0.3
    this._scale = 0.3 + Math.random() * 0.8
    this._position = spawnPosition.clone()
    this.spawnTime = Date.now()

    // Crear fallback visual inmediatamente
    this.createFallbackModel()

    // Intentar cargar modelo GLB
    const loader = new GLTFLoader()
    let modelPath: string
    switch (this.type) {
      case ObstacleType.Star:
        modelPath = '/meteorito.glb' // Usar meteorito por ahora
        break
      case ObstacleType.Trash:
        modelPath = '/meteorito.glb' // Usar meteorito por ahora
        break
      case ObstacleType.Dog:
        modelPath = '/spacial_dog.glb'
        break
      default:
        modelPath = '/meteorito.glb'
    }

    loader.load(modelPath, (gltf: GLTF) => {
      // Si el modelo carga, remover el fallback y usar el modelo real
      if (this._model && this._model.children.length > 0) {
        this.scene.remove(this._model)
      }
      this._model = gltf.scene
      this._model.scale.setScalar(this._scale)
      this._model.position.copy(this._position)
      this._model.rotation.x = Math.random() * Math.PI * 2
      this._model.rotation.y = Math.random() * Math.PI * 2
      this._model.rotation.z = Math.random() * Math.PI * 2
      this._model.traverse(child => child.userData.obstacle = this)
      this.scene.add(this._model)
    }, undefined, () => {
      // Si el modelo falla, mantener el fallback
      console.warn(`Failed to load model: ${modelPath}`)
    })
  }

  /**
   * Crea un modelo visual fallback cuando el archivo GLB no existe
   */
  private createFallbackModel(): void {
    let geometry: SphereGeometry | BoxGeometry
    let color: number

    switch (this.type) {
      case ObstacleType.Star:
        geometry = new SphereGeometry(0.5, 8, 8)
        color = 0xffff00 // Amarillo para estrellas
        break
      case ObstacleType.Trash:
        geometry = new BoxGeometry(0.8, 0.8, 0.8)
        color = 0x888888 // Gris para basura
        break
      case ObstacleType.Dog:
        geometry = new SphereGeometry(0.7, 16, 16)
        color = 0xff6600 // Naranja para perro
        break
      default:
        geometry = new SphereGeometry(0.5, 8, 8)
        color = 0x00ff00
    }

    const material = new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 })
    const mesh = new Mesh(geometry, material)
    mesh.scale.setScalar(this._scale)
    mesh.position.copy(this._position)
    mesh.traverse(child => child.userData.obstacle = this)
    this._model = mesh
    this.scene.add(this._model)
  }

  // Actualiza la posición y rotación del obstáculo
  /**
   * Actualiza la posición y rotación del obstáculo cada frame
   * - Movimiento continuo hacia la nave (Z negativo)
   * - Rotación en los tres ejes para efecto visual dinámico
   * - Gestiona tiempo de vida
   */
  public update(): void {
    this._position.z -= this.speed
    
    if (this._model) {
      this._model.position.copy(this._position)
      this._model.rotation.x += 0.008
      this._model.rotation.y += 0.012
    }

    this.lifetime++
  }

  /**
   * Retorna el tiempo de reacción desde el spawn
   */
  public getReactionTime(): number {
    return Date.now() - this.spawnTime
  }

  /**
   * Retorna la posición actual del obstáculo
   * @returns Vector3 con la posición
   */
  public getPosition(): Vector3 {
    return this._position
  }

  /**
   * Retorna la escala del obstáculo
   * @returns Factor de escala
   */
  public getScale(): number {
    return this._scale
  }

  /**
   * Verifica si el obstáculo ha expirado su tiempo de vida
   */
  public isExpired(): boolean {
    return this.lifetime >= this.maxLifetime
  }

  /**
   * Destruye el obstáculo removiendo el modelo de la escena
   * Libera recursos de memoria
   */
  public destroy(): void {
    if (this._model) {
      this.scene.remove(this._model)
      this._model = null
    }
  }
}