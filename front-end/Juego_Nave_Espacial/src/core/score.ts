/**
 * Clase Score: Gestiona las métricas del juego para evaluación de atención.
 * Métricas:
 * - Tiempo de reacción promedio para estrellas
 * - Número de errores impulsivos (presionar en basura)
 * - Número de omisiones (no presionar en estrella)
 * - Puntos totales
 */

export class Score {
  // Métricas
  private reactionTimes: number[] = []
  private impulsiveErrors: number = 0
  private omissions: number = 0
  private totalPoints: number = 0
  // Sectores
  private currentSector: number = 1
  private itemsPerSector: number = 90
  private totalItems: number = 360
  private itemsSpawned: number = 0

  // Elementos DOM
  private hudContainer: HTMLElement | null = null

  constructor() {
    this.setupHUD()
  }

  /**
   * Configura la interfaz visual (HUD) con métricas
   */
  private setupHUD(): void {
    this.hudContainer = document.createElement('div')
    this.hudContainer.id = 'hud-container'
    this.hudContainer.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      font-family: 'Arial', sans-serif;
      z-index: 1000;
      color: #ffffff;
    `

    const title = document.createElement('div')
    title.textContent = 'El Guardián Espacial'
    title.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    `

    const sector = document.createElement('div')
    sector.id = 'sector'
    sector.textContent = `Sector Galáctico: ${this.currentSector}/4`
    sector.style.cssText = `font-size: 14px; margin-bottom: 5px;`

    const points = document.createElement('div')
    points.id = 'points'
    points.textContent = `Puntos: ${this.totalPoints}`
    points.style.cssText = `font-size: 14px; margin-bottom: 5px;`

    const omissions = document.createElement('div')
    omissions.id = 'omissions'
    omissions.textContent = `Omisiones: ${this.omissions}`
    omissions.style.cssText = `font-size: 14px; margin-bottom: 5px;`

    const errors = document.createElement('div')
    errors.id = 'errors'
    errors.textContent = `Errores Impulsivos: ${this.impulsiveErrors}`
    errors.style.cssText = `font-size: 14px; margin-bottom: 5px;`

    const reaction = document.createElement('div')
    reaction.id = 'reaction'
    const avgRT = this.reactionTimes.length > 0 ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length).toFixed(2) : 'N/A'
    reaction.textContent = `Tiempo Reacción Promedio: ${avgRT} ms`
    reaction.style.cssText = `font-size: 14px;`

    const instructions = document.createElement('div')
    instructions.style.cssText = `
      font-size: 14px;
      color: #00ff00;
      margin-top: 15px;
      font-weight: bold;
      border-top: 1px solid #00ff00;
      padding-top: 10px;
      line-height: 1.8;
    `
    instructions.innerHTML = `
      <div>🎯 CONTROLES:</div>
      <div style="font-size: 13px; color: #ffff00; margin-top: 5px;">
        • ESPACIO: Dispara proyectil al objeto más cercano
      </div>
      <div style="font-size: 12px; color: #ffaa00; margin-top: 8px;">
        ⭐ Destruye estrellas = +10pts<br/>
        🗑️ Destruye basura = -5pts<br/>
        🐕 Destruye perro amigable = -20pts
      </div>
    `

    this.hudContainer.appendChild(title)
    this.hudContainer.appendChild(sector)
    this.hudContainer.appendChild(points)
    this.hudContainer.appendChild(omissions)
    this.hudContainer.appendChild(errors)
    this.hudContainer.appendChild(reaction)
    this.hudContainer.appendChild(instructions)
    document.body.appendChild(this.hudContainer)
  }

  /**
   * Registra cuando se recolecta una estrella
   * @param reactionTime - Tiempo de reacción en ms
   */
  public registerStarCollected(reactionTime: number): void {
    this.reactionTimes.push(reactionTime)
    this.totalPoints += 10
    this.updateHUD()
  }

  /**
   * Registra error impulsivo (presionar en basura)
   */
  public registerImpulsiveError(): void {
    this.impulsiveErrors++
    this.totalPoints -= 5
    this.updateHUD()
  }

  /**
   * Registra omisión (dejar pasar estrella)
   */
  public registerOmission(): void {
    this.omissions++
    this.updateHUD()
  }

  /**
   * Registra cuando se destruye el perro espacial
   */
  public registerDogDestroyed(): void {
    this.totalPoints -= 20
    this.updateHUD()
  }

  /**
   * Registra cuando se recolecta el perro espacial
   */
  public registerDogCollected(): void {
    this.totalPoints += 50
    this.updateHUD()
  }

  /**
   * Incrementa el contador de ítems spawneados
   */
  public itemSpawned(): void {
    this.itemsSpawned++
    if (this.itemsSpawned % this.itemsPerSector === 0 && this.currentSector < 4) {
      this.currentSector++
      this.updateHUD()
      // Aquí se podría añadir animación de viaje
    }
  }

  /**
   * Verifica si el juego terminó
   */
  public isGameOver(): boolean {
    return this.itemsSpawned >= this.totalItems
  }

  /**
   * Actualiza el HUD
   */
  private updateHUD(): void {
    const sector = document.getElementById('sector')
    if (sector) sector.textContent = `Sector Galáctico: ${this.currentSector}/4`

    const points = document.getElementById('points')
    if (points) points.textContent = `Puntos: ${this.totalPoints}`

    const omissions = document.getElementById('omissions')
    if (omissions) omissions.textContent = `Omisiones: ${this.omissions}`

    const errors = document.getElementById('errors')
    if (errors) errors.textContent = `Errores Impulsivos: ${this.impulsiveErrors}`

    const reaction = document.getElementById('reaction')
    if (reaction) {
      const avgRT = this.reactionTimes.length > 0 ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length).toFixed(2) : 'N/A'
      reaction.textContent = `Tiempo Reacción Promedio: ${avgRT} ms`
    }
  }

  /**
   * Retorna métricas finales
   */
  public getFinalMetrics(): { reactionTimes: number[], impulsiveErrors: number, omissions: number, totalPoints: number } {
    return {
      reactionTimes: this.reactionTimes,
      impulsiveErrors: this.impulsiveErrors,
      omissions: this.omissions,
      totalPoints: this.totalPoints
    }
  }
}