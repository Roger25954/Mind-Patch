/**
 * Clase GameOverScreen: Muestra la pantalla de fin de juego con estética apocalíptica espacial.
 * Características:
 * - Overlay oscuro con efecto de distorsión
 * - Mensaje dramaticista de destrucción
 * - Muestra cantidad de meteoritos que destruyeron la nave
 * - Botón de reinicio con efectos visuales
 * - Animaciones de glitch/corrupción
 */
export class GameOverScreen {
  /**
   * Muestra la pantalla de fin de juego con métricas de atención
   * @param metrics - Métricas finales del juego
   */
  public show(metrics: { reactionTimes: number[], impulsiveErrors: number, omissions: number, totalPoints: number }): void {
    const overlay = document.createElement('div')
    overlay.id = 'game-over-overlay'
    
    // Estilos del overlay principal
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.95) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
      font-family: 'Courier New', monospace;
      animation: glitchIn 0.5s ease-out;
    `

    // Contenedor de contenido
    const container = document.createElement('div')
    container.style.cssText = `
      text-align: center;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 0, 0, 0.4);
      animation: scanlines 2s linear infinite;
    `

    // Mensaje de evaluación
    const systemAlert = document.createElement('div')
    systemAlert.textContent = '✓ EVALUACIÓN DE ATENCIÓN COMPLETADA ✓'
    systemAlert.style.cssText = `
      font-size: 1.2rem;
      color: #00ff00;
      text-shadow: 0 0 15px rgba(0, 255, 0, 1);
      margin-bottom: 2rem;
      font-weight: bold;
      letter-spacing: 2px;
      animation: pulse 1s ease-in-out infinite;
    `

    // Título "EVALUACIÓN COMPLETADA"
    const title = document.createElement('h1')
    title.textContent = '█ EVALUACIÓN COMPLETADA █'
    title.style.cssText = `
      font-size: 4rem;
      color: #00ff00;
      margin: 0;
      margin-bottom: 1rem;
      text-shadow: 
        0 0 30px rgba(0, 255, 0, 1),
        0 0 60px rgba(0, 255, 0, 0.7),
        3px 3px 0px rgba(255, 255, 255, 0.5),
        -3px -3px 0px rgba(0, 100, 255, 0.5);
      font-weight: 900;
      letter-spacing: -2px;
      transform: scaleY(1.1);
      animation: glitch 0.3s ease-in-out infinite;
    `

    // Información de métricas
    const metricsInfo = document.createElement('div')
    metricsInfo.style.cssText = `
      font-size: 1.5rem;
      color: #ffaa00;
      margin: 2rem 0;
      font-weight: bold;
      text-shadow: 0 0 10px rgba(255, 170, 0, 0.8);
      border: 2px solid #ff0000;
      padding: 1.5rem;
      border-radius: 8px;
      background: rgba(255, 0, 0, 0.1);
      letter-spacing: 1px;
    `
    
    const points = document.createElement('div')
    points.textContent = `Puntos Totales: ${metrics.totalPoints}`
    points.style.cssText = `
      font-size: 1.3rem;
      color: #ffffff;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
      margin-bottom: 0.5rem;
      animation: flicker 0.15s ease-in-out infinite;
    `
    
    const omissions = document.createElement('div')
    omissions.textContent = `Omisiones: ${metrics.omissions}`
    omissions.style.cssText = `
      font-size: 1.1rem;
      color: #ffaa00;
      margin-bottom: 0.5rem;
    `
    
    const errors = document.createElement('div')
    errors.textContent = `Errores Impulsivos: ${metrics.impulsiveErrors}`
    errors.style.cssText = `
      font-size: 1.1rem;
      color: #ffaa00;
      margin-bottom: 0.5rem;
    `
    
    const avgReaction = metrics.reactionTimes.length > 0 ? (metrics.reactionTimes.reduce((a, b) => a + b, 0) / metrics.reactionTimes.length).toFixed(2) : 'N/A'
    const reaction = document.createElement('div')
    reaction.textContent = `Tiempo Reacción Promedio: ${avgReaction} ms`
    reaction.style.cssText = `
      font-size: 1.1rem;
      color: #ffaa00;
    `

    metricsInfo.appendChild(points)
    metricsInfo.appendChild(omissions)
    metricsInfo.appendChild(errors)
    metricsInfo.appendChild(reaction)

    // Botón de reinicio
    const button = document.createElement('button')
    button.textContent = '[REINICIAR EVALUACIÓN]'
    button.onclick = () => location.reload()
    button.style.cssText = `
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      background: linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(0, 255, 100, 0.3));
      color: #ffffff;
      border: 2px solid #00ff00;
      border-radius: 4px;
      font-weight: bold;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(16, 255, 0, 0.1);
      transition: all 0.3s ease;
      margin-top: 2rem;
      text-transform: uppercase;
      animation: borderGlow 1.5s ease-in-out infinite;
    `

    button.onmouseover = () => {
      button.style.boxShadow = `0 0 30px rgba(255, 255, 255, 0.8), 
                                inset 0 0 30px rgba(16, 255, 0, 0.2),
                                0 0 40px rgba(255, 0, 0, 0.4)`
      button.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))'
    }

    button.onmouseout = () => {
      button.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)'
      button.style.background = 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(255, 100, 0, 0.3))'
    }

    // Armar estructura
    container.appendChild(systemAlert)
    container.appendChild(title)
    container.appendChild(metricsInfo)
    container.appendChild(button)
    overlay.appendChild(container)
    document.body.appendChild(overlay)

    // Agregar estilos de animación
    this.injectAnimationStyles()
  }

  /**
   * Inyecta los estilos de animación necesarios en el documento
   */
  private injectAnimationStyles(): void {
    if (!document.getElementById('game-over-animations')) {
      const style = document.createElement('style')
      style.id = 'game-over-animations'
      style.textContent = `
        @keyframes glitchIn {
          0% {
            opacity: 0;
            transform: translateY(-50px) scaleY(0.8);
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes glitch {
          0%, 100% {
            text-shadow: 
              0 0 30px rgba(255, 0, 0, 1),
              0 0 60px rgba(255, 0, 0, 0.7),
              3px 3px 0px rgba(255, 255, 255, 0.5),
              -3px -3px 0px rgba(0, 100, 255, 0.5);
            transform: scaleY(1.1) skewX(-0.5deg);
          }
          50% {
            text-shadow: 
              0 0 30px rgba(255, 0, 0, 0.8),
              0 0 60px rgba(255, 0, 0, 0.5),
              -3px -3px 0px rgba(255, 255, 255, 0.5),
              3px 3px 0px rgba(0, 100, 255, 0.5);
            transform: scaleY(1.1) skewX(0.5deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            text-shadow: 0 0 15px rgba(255, 0, 0, 1);
          }
          50% {
            opacity: 0.6;
            text-shadow: 0 0 25px rgba(255, 0, 0, 0.5);
          }
        }

        @keyframes scanlines {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes flicker {
          0%, 100% {
            opacity: 1;
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
          }
          50% {
            opacity: 0.8;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2);
          }
        }
      `
      document.head.appendChild(style)
    }
  }
}