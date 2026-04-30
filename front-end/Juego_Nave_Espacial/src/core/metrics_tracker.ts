import { StimulusPresentation, ResponseType, StimulusType } from './stimulus'

/**
 * Interfaz para métricas de un sector galáctico
 */
export interface SectorMetrics {
  sectorNumber: number
  hits: number                         // Respuestas correctas a Go
  misses: number                       // Omisiones (no respondió a Go)
  falseAlarms: number                  // Errores impulsivos (respondió a NoGo)
  correctRejections: number            // No respondió a NoGo (correcto)
  
  reactionTimes: number[]              // Array de RT en ms (solo hits)
  avgReactionTimeMs: number            // Promedio de RT
  medianReactionTimeMs: number         // Mediana de RT
  sdReactionTimeMs: number             // Desviación estándar de RT
  
  totalGo: number                      // Total de estímulos Go en este sector
  totalNoGo: number                    // Total de estímulos NoGo en este sector
  accuracyPercent: number              // (hits / totalGo) * 100
  commissionErrorRate: number          // (falseAlarms / totalNoGo) * 100
}

/**
 * Interfaz para métricas de toda la sesión
 */
export interface SessionMetrics {
  // Totales globales
  totalStimuli: number
  totalGo: number
  totalNoGo: number
  
  // Conteos de respuestas
  globalHits: number
  globalMisses: number
  globalFalseAlarms: number
  globalCorrectRejections: number
  
  // Métricas de tiempo de reacción
  globalAvgRT: number                  // Promedio global de RT
  globalMedianRT: number               // Mediana global de RT
  globalSdRT: number                   // SD global de RT
  
  // Exactitud global
  globalAccuracy: number               // (hits / totalGo) * 100
  globalCommissionErrorRate: number    // (falseAlarms / totalNoGo) * 100
  
  // Datos por sector
  sectors: SectorMetrics[]             // Métricas desglosadas [1,2,3,4]
  
  // Duración y datos crudos
  sessionDurationMs: number
  rawTrials: StimulusPresentation[]    // Datos crudos para exportar/análisis
  sessionStartTime: number             // timestamp de inicio
}

/**
 * Clase MetricsTracker: Registra y calcula métricas clínicas de atención
 * 
 * Sistema de registro preciso basado en performance.now() para:
 * - Tiempo de reacción en milisegundos
 * - Errores por comisión (impulsividad)
 * - Omisiones (inatención)
 * - Variabilidad de RT (posible TDAH)
 * - Degradación por sector (fatiga atencional)
 */
export class MetricsTracker {
  private trials: StimulusPresentation[] = []
  private sessionStartTime: number = 0
  private readonly numSectors: number = 4
  private currentSector: number = 1

  /**
   * Retorna el sector actual (método público para evitar warning de variable no usada)
   */
  public getCurrentSector(): number {
    return this.currentSector
  }

  constructor() {
    this.sessionStartTime = performance.now()
  }

  /**
   * Registra un ensayo (trial) completado
   */
  public recordTrial(stimulus: StimulusPresentation): void {
    this.trials.push(stimulus)
  }

  /**
   * Establece el sector actual (para asociar trials al sector correcto)
   */
  public setCurrentSector(sector: number): void {
    if (sector >= 1 && sector <= this.numSectors) {
      this.currentSector = sector
    }
  }

  /**
   * Calcula el promedio de un array de números
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  /**
   * Calcula la mediana de un array de números
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
  }

  /**
   * Calcula la desviación estándar de un array
   */
  private calculateSD(values: number[]): number {
    if (values.length < 2) return 0
    const mean = this.calculateMean(values)
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
    return Math.sqrt(variance)
  }

  /**
   * Calcula métricas para un sector específico
   */
  private calculateSectorMetrics(sectorNumber: number): SectorMetrics {
    // Filtrar trials del sector
    const sectorTrials = this.trials.filter(t => t.sector === sectorNumber)

    // Contar respuestas
    const hits = sectorTrials.filter(
      t => t.response === ResponseType.Hit
    ).length
    const misses = sectorTrials.filter(
      t => t.response === ResponseType.Miss
    ).length
    const falseAlarms = sectorTrials.filter(
      t => t.response === ResponseType.FalseAlarm
    ).length
    const correctRejections = sectorTrials.filter(
      t => t.response === ResponseType.CorrectRejection
    ).length

    // Totales
    const totalGo = hits + misses
    const totalNoGo = falseAlarms + correctRejections

    // Tiempos de reacción (solo de hits)
    const reactionTimes = sectorTrials
      .filter(t => t.response === ResponseType.Hit && t.reactionTimeMs !== null)
      .map(t => t.reactionTimeMs as number)

    // Calcular estadísticas de RT
    const avgReactionTimeMs = this.calculateMean(reactionTimes)
    const medianReactionTimeMs = this.calculateMedian(reactionTimes)
    const sdReactionTimeMs = this.calculateSD(reactionTimes)

    // Calcular exactitud
    const accuracyPercent = totalGo > 0 ? (hits / totalGo) * 100 : 0
    const commissionErrorRate =
      totalNoGo > 0 ? (falseAlarms / totalNoGo) * 100 : 0

    return {
      sectorNumber,
      hits,
      misses,
      falseAlarms,
      correctRejections,
      reactionTimes,
      avgReactionTimeMs,
      medianReactionTimeMs,
      sdReactionTimeMs,
      totalGo,
      totalNoGo,
      accuracyPercent,
      commissionErrorRate
    }
  }

  /**
   * Genera el reporte completo de sesión
   */
  public generateSessionMetrics(): SessionMetrics {
    const sessionEndTime = performance.now()
    const sessionDurationMs = sessionEndTime - this.sessionStartTime

    // Calcular totales globales
    const totalGo = this.trials.filter(t => t.type === StimulusType.Go).length
    const totalNoGo = this.trials.filter(
      t => t.type === StimulusType.NoGo
    ).length
    const totalStimuli = this.trials.length

    // Contar respuestas globales
    const globalHits = this.trials.filter(
      t => t.response === ResponseType.Hit
    ).length
    const globalMisses = this.trials.filter(
      t => t.response === ResponseType.Miss
    ).length
    const globalFalseAlarms = this.trials.filter(
      t => t.response === ResponseType.FalseAlarm
    ).length
    const globalCorrectRejections = this.trials.filter(
      t => t.response === ResponseType.CorrectRejection
    ).length

    // Tiempos de reacción globales (solo hits)
    const globalReactionTimes = this.trials
      .filter(t => t.response === ResponseType.Hit && t.reactionTimeMs !== null)
      .map(t => t.reactionTimeMs as number)

    const globalAvgRT = this.calculateMean(globalReactionTimes)
    const globalMedianRT = this.calculateMedian(globalReactionTimes)
    const globalSdRT = this.calculateSD(globalReactionTimes)

    // Exactitud global
    const globalAccuracy = totalGo > 0 ? (globalHits / totalGo) * 100 : 0
    const globalCommissionErrorRate =
      totalNoGo > 0 ? (globalFalseAlarms / totalNoGo) * 100 : 0

    // Calcular métricas por sector
    const sectors: SectorMetrics[] = []
    for (let i = 1; i <= this.numSectors; i++) {
      sectors.push(this.calculateSectorMetrics(i))
    }

    return {
      totalStimuli,
      totalGo,
      totalNoGo,
      globalHits,
      globalMisses,
      globalFalseAlarms,
      globalCorrectRejections,
      globalAvgRT,
      globalMedianRT,
      globalSdRT,
      globalAccuracy,
      globalCommissionErrorRate,
      sectors,
      sessionDurationMs,
      rawTrials: [...this.trials],
      sessionStartTime: this.sessionStartTime
    }
  }

  /**
   * Genera un reporte en formato CSV para exportación
   */
  public generateCSVReport(): string {
    const headers = [
      'trial_number',
      'sector',
      'stimulus_type',
      'appeared_at_ms',
      'responded_at_ms',
      'reaction_time_ms',
      'response_type'
    ].join(',')

    const rows = this.trials.map((trial, index) => {
      return [
        index + 1,
        trial.sector,
        trial.type,
        Math.round(trial.appearedAt),
        trial.respondedAt !== null ? Math.round(trial.respondedAt) : '',
        trial.reactionTimeMs !== null ? trial.reactionTimeMs.toFixed(2) : '',
        trial.response || ''
      ].join(',')
    })

    return [headers, ...rows].join('\n')
  }

  /**
   * Detecta señales de alerta posible TDAH (umbrales orientativos)
   */
  public detectADHDIndicators(metrics: SessionMetrics): string[] {
    const alerts: string[] = []

    // RT promedio elevado (lentitud atencional)
    if (metrics.globalAvgRT > 600) {
      alerts.push(
        'RT promedio elevado (>600ms): posible lentitud atencional'
      )
    }

    // SD de RT elevada (variabilidad - señal clave de TDAH)
    if (metrics.globalSdRT > 200) {
      alerts.push(
        'Alta variabilidad en RT (SD>200ms): posible dificultad atencional'
      )
    }

    // Tasa alta de omisiones
    if (metrics.globalMisses / metrics.totalGo > 0.25) {
      alerts.push('Tasa de omisiones elevada (>25%): posible inatención')
    }

    // Tasa alta de errores por comisión
    if (
      metrics.totalNoGo > 0 &&
      metrics.globalFalseAlarms / metrics.totalNoGo > 0.3
    ) {
      alerts.push(
        'Tasa de errores por comisión elevada (>30%): posible impulsividad'
      )
    }

    // Degradación entre Sector 1 y Sector 4 (fatiga atencional)
    if (metrics.sectors.length === 4) {
      const sector1Accuracy = metrics.sectors[0].accuracyPercent
      const sector4Accuracy = metrics.sectors[3].accuracyPercent
      if (sector1Accuracy - sector4Accuracy > 20) {
        alerts.push(
          `Degradación de rendimiento (S1: ${sector1Accuracy.toFixed(1)}% → S4: ${sector4Accuracy.toFixed(1)}%): posible fatiga atencional`
        )
      }
    }

    return alerts
  }

  /**
   * Retorna todos los trials registrados
   */
  public getTrials(): StimulusPresentation[] {
    return [...this.trials]
  }

  /**
   * Limpia todos los trials (para nueva sesión)
   */
  public reset(): void {
    this.trials = []
    this.sessionStartTime = performance.now()
    this.currentSector = 1
  }
}
