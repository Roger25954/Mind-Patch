/**
 * Clase SectorManager: Gestiona los 4 sectores galácticos de la prueba
 * 
 * Responsabilidades:
 * - Nombres y temas de cada sector
 * - Transiciones visuales entre sectores
 * - Control del flujo entre sectores
 * - Manejo de descansos
 */
export class SectorManager {
  private currentSector: number = 1
  private readonly totalSectors: number = 4

  // Nombres temáticos de los sectores
  private readonly sectorNames: string[] = [
    'Nebulosa Polar',      // Sector 1 - Tonos azules fríos
    'Cinturón de Asteria', // Sector 2 - Tonos purpúreos
    'Cuadrante Lyra',      // Sector 3 - Tonos dorados
    'Fosa Abismal'         // Sector 4 - Tonos oscuros rojos
  ]

  // Descripciones para el niño
  private readonly sectorDescriptions: string[] = [
    '¡Bienvenido a la Nebulosa Polar!',
    '¡Llegaste al Cinturón de Asteria!',
    '¡Entrando al Cuadrante Lyra!',
    '¡Último desafío: La Fosa Abismal!'
  ]

  // Colores temáticos (CSS/HEX) para cada sector
  private readonly sectorColors: string[] = [
    '#00d4ff', // Cian frío - Nebulosa Polar
    '#b847ff', // Púrpura - Cinturón de Asteria
    '#ffa500', // Dorado - Cuadrante Lyra
    '#cc0000'  // Rojo oscuro - Fosa Abismal
  ]

  constructor() {
    console.log('[SectorManager] Inicializado con 4 sectores galácticos')
  }

  /**
   * Avanza al siguiente sector
   */
  public nextSector(): boolean {
    if (this.currentSector < this.totalSectors) {
      this.currentSector++
      console.log(`[SectorManager] Avanzando a Sector ${this.currentSector}`)
      return true
    }
    console.log('[SectorManager] Todos los sectores completados')
    return false
  }

  /**
   * Reinicia al primer sector
   */
  public reset(): void {
    this.currentSector = 1
    console.log('[SectorManager] Reiniciado al Sector 1')
  }

  // Getters
  public getCurrentSector(): number {
    return this.currentSector
  }

  public getCurrentSectorName(): string {
    return this.sectorNames[this.currentSector - 1]
  }

  public getCurrentSectorDescription(): string {
    return this.sectorDescriptions[this.currentSector - 1]
  }

  public getCurrentSectorColor(): string {
    return this.sectorColors[this.currentSector - 1]
  }

  public getTotalSectors(): number {
    return this.totalSectors
  }

  public getProgress(): number {
    return this.currentSector / this.totalSectors
  }

  public isComplete(): boolean {
    return this.currentSector > this.totalSectors
  }

  public getSectorName(sector: number): string {
    if (sector >= 1 && sector <= this.totalSectors) {
      return this.sectorNames[sector - 1]
    }
    return ''
  }

  public getSectorColor(sector: number): string {
    if (sector >= 1 && sector <= this.totalSectors) {
      return this.sectorColors[sector - 1]
    }
    return '#ffffff'
  }
}
