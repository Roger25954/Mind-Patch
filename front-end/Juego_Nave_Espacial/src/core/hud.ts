import { SectorManager } from './sector_manager'

/**
 * Clase HUD: Head-Up Display minimalista para niños
 * 
 * Características:
 * - Información de sector actual
 * - Barra de progreso del sector
 * - Recordatorio de instrucciones (solo al inicio)
 * - Indicador de descanso entre sectores
 * - NO muestra métricas en tiempo real (distrae de la tarea)
 */
export class HUD {
  private hudContainer: HTMLElement | null = null
  private sectorNameEl: HTMLElement | null = null
  private progressBarEl: HTMLElement | null = null
  private instructionEl: HTMLElement | null = null
  private breakIndicatorEl: HTMLElement | null = null

  private showInstructionTimeout: ReturnType<typeof setTimeout> | null = null
  private isVisible: boolean = true

  constructor(private readonly sectorManager: SectorManager) {
    this.createHUDElements()
    this.updateDisplay()
  }

  /**
   * Crea los elementos HTML del HUD
   */
  private createHUDElements(): void {
    // Contenedor principal
    this.hudContainer = document.createElement('div')
    this.hudContainer.id = 'game-hud'
    this.hudContainer.className = 'hud-container'

    // Nombre del sector (arriba izquierda)
    this.sectorNameEl = document.createElement('div')
    this.sectorNameEl.id = 'sector-name'
    this.sectorNameEl.className = 'hud-sector-name'
    this.sectorNameEl.textContent = `🌌 ${this.sectorManager.getCurrentSectorName()}`

    // Barra de progreso del sector (visual, no numérico)
    this.progressBarEl = document.createElement('div')
    this.progressBarEl.id = 'progress-bar'
    this.progressBarEl.className = 'hud-progress'

    const progressFill = document.createElement('div')
    progressFill.id = 'progress-fill'
    progressFill.className = 'hud-progress-fill'

    this.progressBarEl.appendChild(progressFill)

    // Texto de instrucciones (solo en primeros 10 segundos)
    this.instructionEl = document.createElement('div')
    this.instructionEl.id = 'instruction-text'
    this.instructionEl.className = 'hud-instructions'
    this.instructionEl.setAttribute('role', 'status')
    this.instructionEl.setAttribute('aria-live', 'polite')
    this.instructionEl.innerHTML = `
      <div style="margin-bottom: 8px;">⭐ Presiona ESPACIO cuando veas estrellas</div>
      <div>🗑️ No hagas nada cuando veas basura</div>
    `

    // Indicador de descanso entre sectores
    this.breakIndicatorEl = document.createElement('div')
    this.breakIndicatorEl.id = 'break-indicator'
    this.breakIndicatorEl.className = 'hud-break'

    // Armar la estructura
    this.hudContainer.appendChild(this.sectorNameEl)
    this.hudContainer.appendChild(this.progressBarEl)
    this.hudContainer.appendChild(this.instructionEl)

    document.body.appendChild(this.hudContainer)
    document.body.appendChild(this.breakIndicatorEl)

    console.log('[HUD] Elementos creados')
  }

  /**
   * Anima la barra de progreso suavemente
   */
  public animateProgress(stimuliCompleted: number, stimuliPerSector: number): void {
    if (!this.progressBarEl) return
    const progressFill = this.progressBarEl.querySelector('#progress-fill') as HTMLElement
    if (!progressFill) return

    const target = Math.max(5, (stimuliCompleted / stimuliPerSector) * 100)
    // Rely on CSS transition for smoothness
    requestAnimationFrame(() => {
      progressFill.style.width = `${target}%`
    })
  }

  /**
   * Actualiza la información mostrada en el HUD
   */
  public updateDisplay(): void {
    if (!this.sectorNameEl || !this.progressBarEl) return

    const color = this.sectorManager.getCurrentSectorColor()
    const progress = this.sectorManager.getProgress()

    // Actualizar nombre del sector
    this.sectorNameEl.textContent = `🌌 ${this.sectorManager.getCurrentSectorName()}`
    this.sectorNameEl.style.color = color
    this.sectorNameEl.style.textShadow = `0 0 10px ${color}`

    // Actualizar barra de progreso
    const progressFill = this.progressBarEl.querySelector('#progress-fill') as HTMLElement
    if (progressFill) {
      progressFill.style.background = `linear-gradient(90deg, ${color}, #ffffff)`
      progressFill.style.boxShadow = `0 0 10px ${color}`
      progressFill.style.width = `${Math.max(10, progress * 100)}%`
    }

    // Actualizar color del borde
    this.progressBarEl.style.borderColor = color
  }

  /**
   * Muestra el recordatorio de instrucciones por 10 segundos
   */
  public showInstructions(durationMs: number = 10000): void {
    if (!this.instructionEl) return

    this.instructionEl.style.opacity = '1'
    this.instructionEl.style.display = 'block'

    if (this.showInstructionTimeout) {
      clearTimeout(this.showInstructionTimeout)
    }

    this.showInstructionTimeout = setTimeout(() => {
      if (this.instructionEl) {
        this.instructionEl.style.opacity = '0'
        setTimeout(() => {
          if (this.instructionEl) {
            this.instructionEl.style.display = 'none'
          }
        }, 500)
      }
    }, durationMs)
  }

  /**
   * Muestra el indicador de descanso entre sectores
   */
  public showBreakIndicator(
    nextSectorName: string,
    durationMs: number = 5000
  ): void {
    if (!this.breakIndicatorEl) return

    this.breakIndicatorEl.innerHTML = `
      <div style="margin-bottom: 20px;">✓ Sector completado</div>
      <div style="font-size: 18px; margin-bottom: 20px;">Próximo: ${nextSectorName}</div>
      <div style="font-size: 14px; color: #aaa;">Descansando...</div>
      <div id="break-countdown" style="margin-top: 15px; font-size: 20px;">5</div>
    `

    this.breakIndicatorEl.style.display = 'block'

    // Cuenta regresiva
    let countdown = 5
    const countdownEl = document.getElementById('break-countdown')
    const countdownInterval = setInterval(() => {
      countdown--
      if (countdownEl) {
        countdownEl.textContent = countdown.toString()
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)

    // Ocultar después del tiempo especificado
    setTimeout(() => {
      this.breakIndicatorEl!.style.display = 'none'
    }, durationMs)
  }

  /**
   * Actualiza la barra de progreso del sector actual
   * Llamado cada vez que se completa un estímulo
   */
  public updateProgressBar(stimuliCompleted: number, stimuliPerSector: number): void {
    if (!this.progressBarEl) return

    const progressFill = this.progressBarEl.querySelector(
      '#progress-fill'
    ) as HTMLElement
    if (progressFill) {
      const progress = Math.max(5, (stimuliCompleted / stimuliPerSector) * 100)
      progressFill.style.width = `${progress}%`
    }
  }

  /**
   * Oculta el HUD
   */
  public hide(): void {
    if (this.hudContainer) {
      this.hudContainer.style.display = 'none'
    }
    this.isVisible = false
  }

  /**
   * Muestra el HUD
   */
  public show(): void {
    if (this.hudContainer) {
      this.hudContainer.style.display = 'block'
    }
    this.isVisible = true
  }

  /**
   * Limpia los elementos del HUD
   */
  public destroy(): void {
    if (this.showInstructionTimeout) {
      clearTimeout(this.showInstructionTimeout)
    }

    if (this.hudContainer && this.hudContainer.parentElement) {
      this.hudContainer.parentElement.removeChild(this.hudContainer)
    }

    if (this.breakIndicatorEl && this.breakIndicatorEl.parentElement) {
      this.breakIndicatorEl.parentElement.removeChild(this.breakIndicatorEl)
    }

    this.hudContainer = null
    this.sectorNameEl = null
    this.progressBarEl = null
    this.instructionEl = null
    this.breakIndicatorEl = null
  }

  /**
   * Obtiene visibilidad actual
   */
  public isHUDVisible(): boolean {
    return this.isVisible
  }
}
