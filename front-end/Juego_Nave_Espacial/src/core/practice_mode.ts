import { Scene } from 'three'
import { Stimulus, StimulusType } from './stimulus'
import { ResponseDetector } from './response_detector'
import { Spaceship } from './spaceship'

/**
 * Clase PracticeMode: Sesión de práctica para familiarizar al niño con la tarea
 * 
 * Características:
 * - 10 estímulos totales (5 Go + 5 NoGo)
 * - Feedback explícito e inmediato para cada respuesta
 * - NO registra métricas (solo práctica)
 * - Interfaz amigable para niños
 * - Termina con mensaje "¿Listo para la misión real?"
 */
export class PracticeMode {
  private scene: Scene
  private spaceship: Spaceship
  private responseDetector: ResponseDetector
  private isActive: boolean = false
  private practiceOverlay: HTMLElement | null = null


  // Configuración de práctica
  private readonly totalStimuli = 10
  private readonly goStimuli = 5
  private readonly noGoStimuli = 5
  private currentStimulusIndex = 0
  private activeStimuli: Stimulus[] = []
  private practiceSequence: StimulusType[] = []

  // Feedback
  private feedbackTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(scene: Scene, spaceship: Spaceship, responseDetector: ResponseDetector) {
    this.scene = scene
    this.spaceship = spaceship
    this.responseDetector = responseDetector

    // Generar secuencia de práctica (5 Go + 5 NoGo alternados aleatoriamente)
    this.generatePracticeSequence()
  }

  /**
   * Genera secuencia de práctica: 5 Go + 5 NoGo
   */
  private generatePracticeSequence(): void {
    const sequence: StimulusType[] = [
      ...Array(this.goStimuli).fill(StimulusType.Go),
      ...Array(this.noGoStimuli).fill(StimulusType.NoGo)
    ]

    // Barajar
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]]
    }

    this.practiceSequence = sequence
    console.log('[PracticeMode] Secuencia generada:', this.practiceSequence)
  }

  /**
   * Inicia la sesión de práctica
   */
  public start(onComplete: () => void): void {
    console.log('[PracticeMode] Iniciando sesión de práctica')
    this.isActive = true
    this.currentStimulusIndex = 0

    // Crear overlay de práctica
    this.createPracticeOverlay()

    // Iniciar presentación de estímulos
    this.presentNextStimulus(onComplete)
  }

  /**
   * Crea el overlay visual de práctica
   */
  private createPracticeOverlay(): void {
    this.practiceOverlay = document.createElement('div')
    this.practiceOverlay.id = 'practice-overlay'
    this.practiceOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 900;
      background: linear-gradient(180deg, rgba(0, 255, 100, 0.2) 0%, transparent 100%);
      border-bottom: 3px solid #00ff64;
      padding: 15px 20px;
      font-family: 'Arial', sans-serif;
      color: #00ff64;
      text-shadow: 0 0 10px #00ff64;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    this.practiceOverlay.innerHTML = `
      <div style="font-size: 16px;">🎓 MODO PRÁCTICA - Aprende cómo jugar</div>
      <div id="practice-progress" style="font-size: 14px;">Estímulo 1/10</div>
      <div id="practice-feedback" style="
        font-size: 16px;
        min-width: 200px;
        text-align: right;
        color: #ffd700;
        min-height: 20px;
      "></div>
    `

    document.body.appendChild(this.practiceOverlay)
  }

  /**
   * Presenta el siguiente estímulo de práctica
   */
  private presentNextStimulus(onComplete: () => void): void {
    if (this.currentStimulusIndex >= this.totalStimuli) {
      // Práctica completada
      this.finishPractice(onComplete)
      return
    }

    const type = this.practiceSequence[this.currentStimulusIndex]
    const initialZ = 60

    // Crear estímulo
    const stimulus = new Stimulus(
      this.scene,
      type,
      initialZ,
      0, // sector 0 = práctica
      this.currentStimulusIndex + 1
    )

    this.activeStimuli.push(stimulus)

    // Actualizar progreso
    this.updateProgress()

    // Configurar ventana de respuesta para práctica
    const practiceWindowMs = 1200
    let hasResponded = false

    const responseWindowTimer = setTimeout(() => {
      if (!hasResponded) {
        // Sin respuesta
        this.handlePracticeResponse(type === StimulusType.Go ? 'miss' : 'correct_rejection', type)
        stimulus.startFadeOut()
        hasResponded = true

        // Pausa antes del siguiente
        setTimeout(() => {
          this.currentStimulusIndex++
          this.presentNextStimulus(onComplete)
        }, 1500)
      }
    }, practiceWindowMs)

    // Interceder en responseDetector para capturar respuesta de práctica
    const tempOnPlayerResponse = () => {
      if (!hasResponded) {
        hasResponded = true
        clearTimeout(responseWindowTimer)

        const presentation = stimulus.getPresentation()
        const responseType =
          type === StimulusType.Go
            ? presentation.response === 'hit'
              ? 'hit'
              : 'miss'
            : presentation.response === 'false_alarm'
              ? 'false_alarm'
              : 'correct_rejection'

        this.handlePracticeResponse(responseType, type)
        stimulus.startFadeOut()

        // Pausa antes del siguiente
        setTimeout(() => {
          this.currentStimulusIndex++
          this.presentNextStimulus(onComplete)
        }, 1500)
      }
    }

    // Temporalmente reemplazar el método
    (this.responseDetector as any).onPlayerResponse = tempOnPlayerResponse
  }

  /**
   * Maneja la respuesta en modo práctica
   */
  private handlePracticeResponse(responseType: string, stimulusType: StimulusType): void {
    let message = ''
    let color = '#ffd700'

    if (stimulusType === StimulusType.Go) {
      if (responseType === 'hit') {
        message = '✅ ¡Correcto! Era una ESTRELLA'
        color = '#00ff64'
      } else {
        message = '⏱️ Te faltó presionar (era una ESTRELLA)'
        color = '#ff9900'
      }
    } else {
      if (responseType === 'correct_rejection') {
        message = '✅ ¡Correcto! Era BASURA (no presionaste)'
        color = '#00ff64'
      } else {
        message = '❌ ¡Ups! Era BASURA, no debías presionar'
        color = '#ff6b6b'
      }
    }

    // Mostrar feedback
    this.showFeedback(message, color)

    // Animar nave al responder correctamente
    if (responseType === 'hit' || responseType === 'correct_rejection') {
      this.spaceship.triggerHitFeedback()
    }

    console.log(`[PracticeMode] Respuesta: ${responseType} (${message})`)
  }

  /**
   * Muestra mensaje de feedback
   */
  private showFeedback(message: string, color: string): void {
    if (!this.practiceOverlay) return

    const feedbackEl = this.practiceOverlay.querySelector('#practice-feedback') as HTMLElement | null
    if (feedbackEl) {
      feedbackEl.textContent = message
      feedbackEl.style.color = color

      // Limpiar feedback anterior
      if (this.feedbackTimeout) {
        clearTimeout(this.feedbackTimeout)
      }

      // Auto-limpiar después de 1 segundo
      this.feedbackTimeout = setTimeout(() => {
        if (feedbackEl) {
          feedbackEl.textContent = ''
        }
      }, 1000)
    }
  }

  /**
   * Actualiza el indicador de progreso
   */
  private updateProgress(): void {
    if (!this.practiceOverlay) return

    const progressEl = this.practiceOverlay.querySelector('#practice-progress')
    if (progressEl) {
      progressEl.textContent = `Estímulo ${this.currentStimulusIndex + 1}/${this.totalStimuli}`
    }
  }

  /**
   * Finaliza la práctica
   */
  private finishPractice(onComplete: () => void): void {
    console.log('[PracticeMode] Práctica completada')
    this.isActive = false

    // Limpiar estímulos activos
    for (const stimulus of this.activeStimuli) {
      stimulus.destroy()
    }
    this.activeStimuli = []

    // Mostrar pantalla de transición
    this.showCompletionScreen(onComplete)
  }

  /**
   * Muestra pantalla de transición: "¿Listo para la misión real?"
   */
  private showCompletionScreen(onComplete: () => void): void {
    if (this.practiceOverlay && this.practiceOverlay.parentElement) {
      this.practiceOverlay.parentElement.removeChild(this.practiceOverlay)
    }

    const completionOverlay = document.createElement('div')
    completionOverlay.id = 'practice-completion'
    completionOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.99) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Arial', sans-serif;
      color: #ffffff;
      padding: 20px;
    `

    completionOverlay.innerHTML = `
      <div style="
        text-align: center;
        max-width: 600px;
      ">
        <!-- Título -->
        <div style="
          font-size: 44px;
          font-weight: bold;
          margin-bottom: 25px;
          color: #00ff64;
          text-shadow: 0 0 20px #00ff64;
        ">
          🎉 ¡Excelente Práctica!
        </div>

        <!-- Mensaje -->
        <div style="
          font-size: 20px;
          margin-bottom: 40px;
          color: #aaa;
          line-height: 1.6;
        ">
          <div style="margin-bottom: 15px;">
            Ya aprendiste cómo jugar. Ahora comprenderás mejor:
          </div>
          <div style="
            background: rgba(0, 255, 100, 0.1);
            border: 2px solid #00ff64;
            border-radius: 8px;
            padding: 20px;
            text-align: left;
            display: inline-block;
          ">
            <div style="margin: 8px 0;"><strong>⭐ ESTRELLAS:</strong> Presiona RÁPIDO</div>
            <div style="margin: 8px 0;"><strong>🗑️ BASURA:</strong> NO presiones (resiste)</div>
            <div style="margin: 8px 0;"><strong>⏱️ TIEMPO:</strong> Tienes ~1 segundo</div>
          </div>
        </div>

        <!-- Botón de inicio -->
        <button id="btn-start-real-mission" style="
          background: linear-gradient(135deg, #00ff64, #00dd00);
          color: #000;
          border: none;
          padding: 16px 45px;
          font-size: 20px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 25px #00ff64;
          margin-top: 30px;
        ">
          🚀 ¡COMENZAR LA MISIÓN REAL!
        </button>

        <!-- Nota -->
        <div style="
          margin-top: 30px;
          font-size: 13px;
          color: #666;
        ">
          Recuerda: Esta vez se registrarán tus resultados reales
        </div>
      </div>
    `

    document.body.appendChild(completionOverlay)

    const btnStartMission = document.getElementById('btn-start-real-mission')
    if (btnStartMission) {
      btnStartMission.addEventListener('click', () => {
        completionOverlay.remove()
        onComplete()
      })
    }
  }

  /**
   * Actualiza estímulos activos en el bucle
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return

    for (let i = this.activeStimuli.length - 1; i >= 0; i--) {
      const stimulus = this.activeStimuli[i]
      stimulus.update(deltaTime)

      // Remover si fue destruido y no tiene modelo en escena
      if (!stimulus.isActive()) {
        const model = stimulus.getModel()
        if (!model || !model.parent) {
          this.activeStimuli.splice(i, 1)
        }
      }
    }
  }

  /**
   * Limpia recursos
   */
  public destroy(): void {
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout)
    }

    for (const stimulus of this.activeStimuli) {
      stimulus.destroy()
    }
    this.activeStimuli = []

    if (this.practiceOverlay && this.practiceOverlay.parentElement) {
      this.practiceOverlay.parentElement.removeChild(this.practiceOverlay)
    }

    this.isActive = false
  }

  /**
   * Obtiene si la práctica está activa
   */
  public isRunning(): boolean {
    return this.isActive
  }
}
