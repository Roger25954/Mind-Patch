import { Scene, Object3D, Vector3, Mesh, SphereGeometry, MeshBasicMaterial, BoxGeometry, MeshStandardMaterial } from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/Addons.js'

export enum StimulusType {
  Go = 'star',
  NoGo = 'trash'
}

export enum ResponseType {
  Hit = 'hit',
  Miss = 'miss',
  FalseAlarm = 'false_alarm',
  CorrectRejection = 'correct_rejection'
}

export interface StimulusPresentation {
  id: string
  type: StimulusType
  appearedAt: number
  respondedAt: number | null
  response: ResponseType | null
  reactionTimeMs: number | null
  sector: number
  sequenceNumber: number
}

export class Stimulus {
  private gltfLoader = new GLTFLoader()
  private model: Object3D | null = null
  private debugMarker: Mesh | null = null
  private position: Vector3
  // Lower speed so stimuli take longer to reach the camera (more reaction time)
  private readonly speed: number = 10
  // Tiempo mínimo que el estímulo debe permanecer visible (ms)
  private readonly lifetimeMs: number = 5000
  private readonly presentation: StimulusPresentation

  // Renombrado para evitar conflicto con el getter público isDestroyed()
  private _destroyed = false

  private fadeStartTime: number | null = null
  private readonly fadeDurationMs: number = 300

  private readonly getTargetPosition?: () => Vector3

  constructor(
    private readonly scene: Scene,
    type: StimulusType,
    initialPosition: Vector3,
    sector: number,
    sequenceNumber: number,
    getTargetPosition?: () => Vector3
  ) {
    this.getTargetPosition = getTargetPosition
    this.presentation = {
      id: `stimulus_${Date.now()}_${Math.random()}`,
      type,
      appearedAt: performance.now(),
      respondedAt: null,
      response: null,
      reactionTimeMs: null,
      sector,
      sequenceNumber
    }

    // Posición inicial ahora viene desde caller (posición en world-space)
    this.position = initialPosition.clone()
    this.loadModel(type)
  }

  private loadModel(type: StimulusType): void {
    const modelPath = type === StimulusType.Go ? '/star.glb' : '/trash.glb'

    this.gltfLoader.load(
      modelPath,
      (gltf: GLTF) => {
        this.model = gltf.scene
        this.model.position.copy(this.position)
        // Aumentar escala de modelos GLB para visibilidad
        this.model.scale.setScalar(4)
        // Asegurar que Three.js no descarte el modelo por frustum culling
        this.model.traverse((child) => {
          // Evitar que la escena descarte modelos con bounding boxes incorrectas
          // Esto evita que estímulos aparezcan invisibles en algunos frames
          // (especialmente para modelos cargados asíncronamente)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          child.frustumCulled = false

          if (child instanceof Mesh) {
            const mat = child.material
            if (mat instanceof MeshStandardMaterial || mat instanceof MeshBasicMaterial) {
              mat.transparent = true
              mat.opacity = 1
              mat.depthWrite = false
            }
          }
        })
        this.scene.add(this.model)
        console.log(`[Stimulus] Modelo GLB cargado: ${modelPath} id=${this.getId()}`)
        try {
          const marker = new Mesh(
            new SphereGeometry(1.2, 12, 12),
            new MeshBasicMaterial({ color: 0xffff00, depthTest: false, transparent: true, opacity: 0.95 })
          )
          // @ts-ignore
          marker.frustumCulled = false
          marker.position.copy(this.position)
          marker.scale.setScalar(6)
          marker.material.depthWrite = false
          marker.renderOrder = 10
          this.scene.add(marker)
          this.debugMarker = marker
        } catch (e) {
          console.warn('[Stimulus] No se pudo añadir marcador de depuración', e)
        }
      },
      undefined,
      () => {
        console.log(`[Stimulus] GLB no encontrado, usando fallback procedimental`)
        this.createProceduralModel(type)
      }
    )
  }

  private createProceduralModel(type: StimulusType): void {
    let geometry
    let material

    if (type === StimulusType.Go) {
      geometry = new SphereGeometry(2.5, 32, 32)
      material = new MeshBasicMaterial({ color: 0xffd700 })
    } else {
      geometry = new BoxGeometry(2.5, 2.5, 2.5)
      material = new MeshBasicMaterial({ color: 0xff4444 })
    }
    this.model = new Mesh(geometry, material)
    this.model.position.copy(this.position)
    // Aumentar un poco la escala para mayor visibilidad
    this.model.scale.setScalar(1.5)
    // Evitar frustum culling en modelos procedurales
    // @ts-ignore
    this.model.traverse?.((child: any) => (child.frustumCulled = false))
    if (this.model instanceof Mesh) {
      const mat = this.model.material as MeshBasicMaterial
      mat.transparent = true
      mat.opacity = 1
      mat.depthWrite = false
    }
    try {
      const marker = new Mesh(
        new SphereGeometry(1.2, 12, 12),
        new MeshBasicMaterial({ color: 0xffff00, depthTest: false, transparent: true, opacity: 0.95 })
      )
      // @ts-ignore
      marker.frustumCulled = false
      marker.position.copy(this.position)
      marker.scale.setScalar(6)
      marker.material.depthWrite = false
      marker.renderOrder = 10
      this.scene.add(marker)
      this.debugMarker = marker
    } catch (e) {
      console.warn('[Stimulus] No se pudo añadir marcador de depuración procedimental', e)
    }
    this.scene.add(this.model)
    console.log(`[Stimulus] Modelo procedimental creado id=${this.getId()} type=${type} pos=${this.position.toArray()}`)
  }

  public update(deltaTime: number): void {
    if (!this.model || this._destroyed) return

    // Si existe un target provider (e.g., la nave), mover en su dirección
    if (this.getTargetPosition) {
      const target = this.getTargetPosition()
      const dir = target.clone().sub(this.model.position)
      const dist = dir.length()
      if (dist > 0.001) {
        dir.normalize()
        const move = dir.multiplyScalar(this.speed * deltaTime)
        this.model.position.add(move)
        this.position.copy(this.model.position)
      }
    } else {
      // Movimiento simple hacia el origen negativo Z por compatibilidad con spawn histórico
      this.position.z -= this.speed * deltaTime
      this.model.position.copy(this.position)
    }

    this.model.rotation.x += 0.01
    this.model.rotation.y += 0.015

    // Fade out
    if (this.fadeStartTime !== null) {
      const fadeElapsed = performance.now() - this.fadeStartTime
      const fadeProgress = Math.min(fadeElapsed / this.fadeDurationMs, 1)

      this.model.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material as MeshBasicMaterial | MeshStandardMaterial
          mat.opacity = 1 - fadeProgress
        }
      })

      if (fadeProgress >= 1) {
        this.destroy()
      }
    }

    // Auto-destruir si supera lifetime sin respuesta
    const aliveMs = performance.now() - this.presentation.appearedAt
    if (aliveMs >= this.lifetimeMs && this.fadeStartTime === null) {
      this.onResponseWindowExpired()
    }
  }

  public recordResponse(reactionTimeMs: number): void {
    this.presentation.respondedAt = performance.now()
    this.presentation.reactionTimeMs = reactionTimeMs

    if (this.presentation.type === StimulusType.Go) {
      this.presentation.response = ResponseType.Hit
    } else {
      this.presentation.response = ResponseType.FalseAlarm
    }

    // Iniciar fade inmediatamente al responder
    this.startFadeOut()
  }

  public onResponseWindowExpired(): void {
    if (this.presentation.response !== null) return

    if (this.presentation.type === StimulusType.Go) {
      this.presentation.response = ResponseType.Miss
    } else {
      this.presentation.response = ResponseType.CorrectRejection
    }

    this.startFadeOut()
  }

  public startFadeOut(): void {
    if (this.fadeStartTime !== null) return
    this.fadeStartTime = performance.now()

    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof Mesh) {
          const mat = child.material as MeshBasicMaterial | MeshStandardMaterial
          mat.transparent = true
          mat.opacity = 1
        }
      })
    }
  }

  public destroy(): void {
    if (this._destroyed) return
    this._destroyed = true

    if (this.model) {
      this.scene.remove(this.model)
      this.model.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose()
          const mat = child.material
          if (Array.isArray(mat)) {
            mat.forEach(m => m.dispose())
          } else {
            mat?.dispose()
          }
        }
      })
    }
    // Limpiar marcador de depuración si existe
    if (this.debugMarker) {
      try {
        this.scene.remove(this.debugMarker)
        this.debugMarker.geometry?.dispose()
        const m = (this.debugMarker.material as any)
        if (m) m.dispose?.()
      } catch (e) {
        console.warn('[Stimulus] Error limpiando debugMarker', e)
      }
      this.debugMarker = null
    }
  }

  // Getters
  public getPresentation(): StimulusPresentation {
    return this.presentation
  }

  public getPosition(): Vector3 {
    return this.position.clone()
  }

  public getModel(): Object3D | null {
    return this.model
  }

  public getType(): StimulusType {
    return this.presentation.type
  }

  public getId(): string {
    return this.presentation.id
  }

  // Getter publico que expone _destroyed — necesario para StimulusScheduler
  public isDestroyed(): boolean {
    return this._destroyed
  }

  public isActive(): boolean {
    return !this._destroyed && this.presentation.response === null
  }

  public hasResponded(): boolean {
    return this.presentation.response !== null
  }
}