import { Scene, Vector3 } from 'three'
import { Stimulus, StimulusType } from './stimulus'

export const PRUEBA_CONFIG = {
  goRatio: 0.75,
  noGoRatio: 0.25,
  stimulusDurationMs: 1200,
  minISI_ms: 1500,
  maxISI_ms: 3000,
  stimuliPerSector: 25,
  responseWindowMs: 1200,
  numSectors: 4,
  sectorBreakMs: 5000
}

export class StimulusScheduler {
  private currentSector: number = 1
  private sequenceNumber: number = 0
  private isScheduling: boolean = false

  private sequences: StimulusType[][] = []
  private activeStimuli: Stimulus[] = []
  private currentStimulus: Stimulus | null = null

  private onStimulusAppeared: ((stimulus: Stimulus) => void) | null = null
  private onSectorComplete: ((sector: number) => void) | null = null
  private onAllComplete: (() => void) | null = null

  // getSpawnPosition: optional function returning a world-space Vector3
  // getTargetPosition: optional function returning current target world-space Vector3 (e.g., spaceship)
  // isAllowedToSpawn: optional predicate that must return true for stimuli to be presented
  constructor(
    private readonly scene: Scene,
    private readonly getSpawnPosition?: () => Vector3,
    private readonly getTargetPosition?: () => Vector3,
    private readonly isAllowedToSpawn?: () => boolean
  ) {
    this.generateAllSequences()
  }

  private generateAllSequences(): void {
    this.sequences = []
    for (let sector = 1; sector <= PRUEBA_CONFIG.numSectors; sector++) {
      this.sequences.push(this.generateSectorSequence())
    }
    console.log('[StimulusScheduler] Secuencias generadas para 4 sectores')
  }

  private generateSectorSequence(): StimulusType[] {
    const total = PRUEBA_CONFIG.stimuliPerSector
    const numGo = Math.round(total * PRUEBA_CONFIG.goRatio)
    const numNoGo = total - numGo

    const sequence: StimulusType[] = [
      ...Array(numGo).fill(StimulusType.Go),
      ...Array(numNoGo).fill(StimulusType.NoGo)
    ]

    return this.shuffleWithMaxConsecutive(sequence, 3)
  }

  private shuffleWithMaxConsecutive(array: StimulusType[], maxConsecutive: number): StimulusType[] {
    let attempts = 0
    while (attempts < 100) {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      if (this.isValidSequence(shuffled, maxConsecutive)) return shuffled
      attempts++
    }
    return array
  }

  private isValidSequence(sequence: StimulusType[], maxConsecutive: number): boolean {
    let count = 1
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] === sequence[i - 1]) {
        count++
        if (count > maxConsecutive) return false
      } else {
        count = 1
      }
    }
    return true
  }

  public start(
    onAppeared: (stimulus: Stimulus) => void,
    onSectorComplete: (sector: number) => void,
    onAllComplete: () => void
  ): void {
    this.onStimulusAppeared = onAppeared
    this.onSectorComplete = onSectorComplete
    this.onAllComplete = onAllComplete
    this.isScheduling = true
    this.currentSector = 1
    this.sequenceNumber = 0

    console.log('[StimulusScheduler] Iniciando presentación de prueba')
    this.presentNextStimulus()
  }

  private presentNextStimulus(): void {
    console.log(`[StimulusScheduler] presentNextStimulus() called - isScheduling=${this.isScheduling} currentSector=${this.currentSector} sequenceNumber=${this.sequenceNumber}`)
    if (!this.isScheduling) return

    // Si existe un proveedor que controla si es válido spawnear (ej. la prueba está activa), comprobarlo
    if (this.isAllowedToSpawn && !this.isAllowedToSpawn()) {
      // Reintentar después de un corto delay sin avanzar la secuencia
      setTimeout(() => this.presentNextStimulus(), 500)
      return
    }

    // NOTE: se permite que el scheduler programe el siguiente estímulo incluso si
    // hay estímulos activos simultáneamente. Evitar bloqueos donde un estímulo
    // nunca se marca como destruido y detiene la secuencia.

    const sectorSequence = this.sequences[this.currentSector - 1]

    if (this.sequenceNumber >= sectorSequence.length) {
      console.log(`[StimulusScheduler] Sector ${this.currentSector} completado`)

      if (this.onSectorComplete) this.onSectorComplete(this.currentSector)

      if (this.currentSector < PRUEBA_CONFIG.numSectors) {
        this.currentSector++
        this.sequenceNumber = 0
        setTimeout(() => this.presentNextStimulus(), PRUEBA_CONFIG.sectorBreakMs)
      } else {
        this.isScheduling = false
        if (this.onAllComplete) this.onAllComplete()
      }
      return
    }

    const type = sectorSequence[this.sequenceNumber]
    const globalSequenceNumber = (this.currentSector - 1) * sectorSequence.length + this.sequenceNumber

    // Obtener posición inicial desde el proveedor si existe (usualmente la cámara)
    let spawnPos: Vector3
    if (this.getSpawnPosition) {
      spawnPos = this.getSpawnPosition()
    } else {
      // posición por defecto delante del origen
      spawnPos = new Vector3(0, 1.8, 20)
    }

    const stimulus = new Stimulus(
      this.scene,
      type,
      spawnPos,
      this.currentSector,
      globalSequenceNumber + 1,
      this.getTargetPosition
    )

    this.currentStimulus = stimulus
    this.activeStimuli.push(stimulus)

    if (this.onStimulusAppeared) this.onStimulusAppeared(stimulus)

    const isiMs = Math.random() * (PRUEBA_CONFIG.maxISI_ms - PRUEBA_CONFIG.minISI_ms) + PRUEBA_CONFIG.minISI_ms

    this.sequenceNumber++

    const delay = PRUEBA_CONFIG.stimulusDurationMs + isiMs
    console.log(`[StimulusScheduler] Programando siguiente estímulo en ${delay}ms (sequenceNumber=${this.sequenceNumber})`)
    setTimeout(() => this.presentNextStimulus(), delay)
  }

  public update(deltaTime: number): void {
    // Log removed to avoid flooding console/DOM while running at ~60fps
    for (let i = this.activeStimuli.length - 1; i >= 0; i--) {
      const stimulus = this.activeStimuli[i]
      stimulus.update(deltaTime)

      // Watchdog: si un estímulo lleva demasiado tiempo activo (posible fuga), forzar destrucción
      try {
        const appeared = stimulus.getPresentation().appearedAt
        const age = performance.now() - appeared
        const FORCE_KILL_MS = 8000
        if (age > FORCE_KILL_MS) {
          console.warn('[StimulusScheduler] Forzando destrucción de estímulo antiguo id=', stimulus.getId(), 'ageMs=', age)
          stimulus.destroy()
          this.activeStimuli.splice(i, 1)
          continue
        }
      } catch (e) {}

      // Eliminar solo cuando el modelo fue completamente destruido
      if (stimulus.isDestroyed()) {
        this.activeStimuli.splice(i, 1)
      }
    }
  }

  public pause(): void {
    this.isScheduling = false
    console.log('[StimulusScheduler] Parado')
  }

  public resume(): void {
    this.isScheduling = true
    console.log('[StimulusScheduler] Reanudado')
  }

  public stop(): void {
    this.isScheduling = false
    for (const stimulus of this.activeStimuli) {
      stimulus.destroy()
    }
    this.activeStimuli = []
    this.currentStimulus = null
    console.log('[StimulusScheduler] Detenido')
  }

  public reset(): void {
    this.stop()
    this.generateAllSequences()
    this.currentSector = 1
    this.sequenceNumber = 0
    console.log('[StimulusScheduler] Reiniciado')
  }

  public getCurrentSector(): number { return this.currentSector }
  public getSequenceNumber(): number { return this.sequenceNumber }
  public isRunning(): boolean { return this.isScheduling }
  public getActiveStimuli(): Stimulus[] { return [...this.activeStimuli] }
  public getCurrentStimulus(): Stimulus | null { return this.currentStimulus }
  public getCurrentSequence(): StimulusType[] { return [...this.sequences[this.currentSector - 1]] }
}