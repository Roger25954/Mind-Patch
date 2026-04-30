/**
 * Clase InputController: Gestiona la entrada del usuario (teclado y touch).
 * 
 * Rediseño para prueba Go/No-Go:
 * - Detecta presión de barra espaciadora (teclado)
 * - Detecta toque en pantalla (touch - para tablets)
 * - Registra timestamp preciso con performance.now()
 * - Compatible con ambos tipos de entrada (móvil y escritorio)
 */

export interface InputResponse {
  pressed: boolean
  timestamp: number
}

export class InputController {
  // Indica si la barra espaciadora o toque fue presionado
  public spacePressed: boolean = false
  private lastResponseTimestamp: number = 0

  constructor() {
    this.listenToEvents()
    console.log('[InputController] Inicializado (teclado + touch)')
  }

  /**
   * Consume y retorna si espacio fue presionado, reseteándolo a false
   * Retorna objeto con estado booleano y timestamp preciso
   * @returns Objeto con estado de presión y timestamp
   */
  public consumeSpace(): InputResponse {
    const pressed = this.spacePressed
    this.lastResponseTimestamp = pressed ? performance.now() : 0

    if (pressed) {
      console.log(`[InputController] Respuesta detectada en ${this.lastResponseTimestamp.toFixed(2)}ms`)
    }

    this.spacePressed = false
    return {
      pressed,
      timestamp: this.lastResponseTimestamp
    }
  }

  /**
   * Maneja el evento de keydown para barra espaciadora
   */
  private onKeyDown = (event: KeyboardEvent): void => {
    const isSpace = event.key === ' ' || event.code === 'Space' || event.keyCode === 32

    if (isSpace) {
      event.preventDefault()
      this.spacePressed = true
    }
  }

  /**
   * Maneja el evento de touchstart para soporte móvil/tablet
   * Cualquier toque en la pantalla se considera una respuesta
   */
  private onTouchStart = (event: TouchEvent): void => {
    event.preventDefault()
    this.spacePressed = true
    console.log(`[InputController] Toque detectado`)
  }

  /**
   * Configura los event listeners para teclado y touch
   */
  private listenToEvents(): void {
    // Listeners de teclado
    document.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keydown', this.onKeyDown)

    // Listeners de touch para tablets/móviles
    document.addEventListener('touchstart', this.onTouchStart, { passive: false })
    window.addEventListener('touchstart', this.onTouchStart, { passive: false })

    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (canvas) {
      canvas.addEventListener('keydown', this.onKeyDown)
      canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    }

    console.log('[InputController] Event listeners configurados (keydown + touchstart)')
  }

  /**
   * Obtiene el timestamp de la última respuesta
   */
  public getLastResponseTimestamp(): number {
    return this.lastResponseTimestamp
  }

  /**
   * Limpia los event listeners (útil para destrucción)
   */
  public destroy(): void {
    document.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('touchstart', this.onTouchStart)

    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (canvas) {
      canvas.removeEventListener('keydown', this.onKeyDown)
      canvas.removeEventListener('touchstart', this.onTouchStart)
    }

    console.log('[InputController] Event listeners removidos')
  }
}