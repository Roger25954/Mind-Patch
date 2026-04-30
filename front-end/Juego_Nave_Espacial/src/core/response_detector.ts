import { Stimulus, StimulusType } from './stimulus'
import { MetricsTracker } from './metrics_tracker'
import { ParticleSystem } from './particle_system'
import { Scene, Vector3 } from 'three'

/**
 * Clase ResponseDetector: Árbitro de respuestas en la prueba Go/No-Go
 * 
 * Responsabilidades:
 * - Registrar cuándo aparece un estímulo
 * - Detectar respuesta del jugador (presión de espacio/toque)
 * - Medir tiempo de reacción con precisión
 * - Clasificar respuesta (hit, miss, false_alarm, correct_rejection)
 * - Generar feedback visual apropiado
 * - Registrar en metrics_tracker
 */
export class ResponseDetector {
  private currentStimulus: Stimulus | null = null
  private responseWindowTimer: ReturnType<typeof setTimeout> | null = null
  // Ventana estándar de respuesta aumentada para dar más tiempo al jugador
  private responseWindowMs: number = 2000 // ms
  private audio: { whoosh?: HTMLAudioElement; chime?: HTMLAudioElement; buzz?: HTMLAudioElement } = {}

  constructor(
    private readonly metricsTracker: MetricsTracker,
    private readonly scene: Scene,
    audio?: { whoosh?: HTMLAudioElement; chime?: HTMLAudioElement; buzz?: HTMLAudioElement }
  ) {
    if (audio) this.audio = audio
  }

  /**
   * Llamado cuando aparece un nuevo estímulo
   * Inicia la ventana de respuesta
   */
  public onStimulusAppeared(stimulus: Stimulus): void {
    this.currentStimulus = stimulus

    // Limpiar timer anterior si existe
    if (this.responseWindowTimer) {
      clearTimeout(this.responseWindowTimer)
    }

    // Iniciar ventana de respuesta
    this.responseWindowTimer = setTimeout(
      () => this.onResponseWindowExpired(),
      this.responseWindowMs
    )

    console.log(
      `[ResponseDetector] Estímulo apareció: ${stimulus.getType()} - Ventana de ${this.responseWindowMs}ms`
    )
  }

  /**
   * Llamado cuando el niño presiona espacio/toca pantalla
   * Registra la respuesta y el tiempo de reacción
   */
  public onPlayerResponse(): void {
    if (!this.currentStimulus) {
      // Respuesta sin estímulo activo → ignorar
      console.log('[ResponseDetector] Respuesta sin estímulo activo (ignorada)')
      return
    }

    if (this.currentStimulus.hasResponded()) {
      // Ya fue respondido este estímulo
      return
    }

    // Calcular tiempo de reacción con precisión
    const presentation = this.currentStimulus.getPresentation()
    const reactionTimeMs = performance.now() - presentation.appearedAt

    // Registrar la respuesta
    this.currentStimulus.recordResponse(reactionTimeMs)

    // Generar feedback visual según tipo de respuesta
    if (this.currentStimulus.getType() === StimulusType.Go) {
      // Hit: respuesta correcta a Go
      console.log(
        `✅ HIT - Go respondido en ${reactionTimeMs.toFixed(2)}ms`
      )
      this.triggerHitFeedback(this.currentStimulus.getPosition())
    } else {
      // False Alarm: respuesta incorrecta a NoGo
      console.log(
        `❌ FALSE ALARM - NoGo respondido en ${reactionTimeMs.toFixed(2)}ms`
      )
      this.triggerFalseAlarmFeedback()
    }

    // Registrar en tracker de métricas
    this.metricsTracker.recordTrial(presentation)

    // Iniciar fade out del estímulo
    this.currentStimulus.startFadeOut()

    // Limpiar estado
    this.clearCurrentStimulus()
  }

  /**
   * Se ejecuta cuando se vence la ventana de respuesta sin respuesta
   */
  private onResponseWindowExpired(): void {
    if (!this.currentStimulus) {
      return
    }

    if (this.currentStimulus.hasResponded()) {
      // Ya fue respondido, no hacer nada
      return
    }

    const presentation = this.currentStimulus.getPresentation()

    // Notificar al estímulo que venció la ventana
    this.currentStimulus.onResponseWindowExpired()

    // Registrar el resultado
    if (this.currentStimulus.getType() === StimulusType.Go) {
      console.log(`⏱️  MISS - Go no fue respondido`)
      // No hay feedback visual para omisiones (la ausencia de recompensa es el feedback)
    } else {
      console.log(`✓ CORRECT REJECTION - NoGo correctamente ignorado`)
      // No hay feedback para rechazo correcto (la ausencia es la respuesta)
    }

    // Registrar en tracker
    this.metricsTracker.recordTrial(presentation)

    // Iniciar fade out
    this.currentStimulus.startFadeOut()

    // Limpiar estado
    this.clearCurrentStimulus()
  }

  /**
   * Feedback visual para respuesta correcta (hit)
   * Partículas doradas/luminosas en posición del estímulo
   */
  private triggerHitFeedback(position: Vector3): void {
    // Reproducir sonido de acierto si está disponible
    try {
      this.audio.chime?.currentTime && (this.audio.chime.currentTime = 0)
      this.audio.chime?.play().catch(() => {})
    } catch (e) {}

    // Crear partículas doradas
    ParticleSystem.burst(this.scene, position, 0xffd700, 36, 0.16)

    // El ParticleSystem se destruye automáticamente al final del lifetime
  }

  /**
   * Feedback visual para error por comisión (false alarm)
   * Flash rojo suave en los bordes de pantalla (no aterrador para niños)
   */
  private triggerFalseAlarmFeedback(): void {
    // Flash rojo suave - se logra con una partícula grande y semi-transparente
    // Reproducir sonido de falsa alarma si existe
    try {
      this.audio.buzz?.currentTime && (this.audio.buzz.currentTime = 0)
      this.audio.buzz?.play().catch(() => {})
    } catch (e) {}

    const screenCenter = new Vector3(0, 0, -5)
    ParticleSystem.burst(this.scene, screenCenter, 0xff4444, 12, 0.32)

    console.log('[Feedback] Error por comisión - flash rojo suave')
  }

  /**
   * Limpia el estado del estímulo actual
   */
  private clearCurrentStimulus(): void {
    this.currentStimulus = null

    if (this.responseWindowTimer) {
      clearTimeout(this.responseWindowTimer)
      this.responseWindowTimer = null
    }
  }

  /**
   * Obtiene el estímulo actual (para debugging)
   */
  public getCurrentStimulus(): Stimulus | null {
    return this.currentStimulus
  }

  /**
   * Cambia la duración de la ventana de respuesta
   * (Útil para configuración clínica)
   */
  public setResponseWindowMs(ms: number): void {
    if (ms > 0 && ms <= 3000) {
      this.responseWindowMs = ms
    }
  }

  /**
   * Limpia recursos al destruir
   */
  public destroy(): void {
    if (this.responseWindowTimer) {
      clearTimeout(this.responseWindowTimer)
    }
    this.currentStimulus = null
  }
}
