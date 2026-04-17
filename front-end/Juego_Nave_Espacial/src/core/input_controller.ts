/**
 * Clase InputController: Gestiona la entrada del usuario (teclado).
 * Registra presiones de barra espaciadora para Go/No-Go
 */

export class InputController {
  // Indica si la barra espaciadora fue presionada
  public spacePressed: boolean = false

  constructor() {
    this.listenToEvents()
    console.log('InputController inicializado')
  }

  /**
   * Consume y retorna si espacio fue presionado, reseteándolo a false
   * @returns true si espacio fue presionado desde el último consume
   */
  public consumeSpace(): boolean {
    const pressed = this.spacePressed
    if (pressed) {
      console.log('Espacio consumido')
    }
    this.spacePressed = false
    return pressed
  }

  /**
   * Maneja el evento de keydown para espacio
   */
  private onKeyDown = (event: KeyboardEvent): void => {
    // Comprobaciones múltiples del espacio
    const isSpace = event.key === ' ' || event.code === 'Space' || event.keyCode === 32
    
    if (isSpace) {
      console.log('🔴 ESPACIO PRESIONADO - evento capturado')
      console.log('  Key:', event.key, 'Code:', event.code, 'KeyCode:', event.keyCode)
      event.preventDefault()
      this.spacePressed = true
    }
  }

  /**
   * Configura los event listeners para teclado
   */
  private listenToEvents(): void {
    // Agregar listener a múltiples niveles para asegurar captura
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    if (canvas) {
      canvas.addEventListener('keydown', this.onKeyDown)
      console.log('Event listener agregado al canvas')
    }
    
    document.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keydown', this.onKeyDown)
    console.log('Event listeners configurados en canvas, document y window')
  }
}