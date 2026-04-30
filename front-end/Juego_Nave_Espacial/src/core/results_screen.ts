import { SessionMetrics } from './metrics_tracker'

/**
 * Clase ResultsScreen: Pantalla de resultados con dos vistas
 * 
 * - Vista para niño: felicitación, sin métricas numéricas
 * - Vista para evaluador: datos clínicos detallados, indicadores TDAH, exportar CSV
 */
export class ResultsScreen {
  private overlayEl: HTMLElement | null = null
  // currentView retained visually in DOM; internal tracking not required currently

  /**
   * Muestra la pantalla de resultados
   */
  public show(
    metrics: SessionMetrics,
    adhd_alerts: string[],
    onExport?: (csv: string) => void,
    audio?: { fanfare?: HTMLAudioElement; buzz?: HTMLAudioElement }
  ): void {
    // Crear overlay principal
    this.overlayEl = document.createElement('div')
    this.overlayEl.id = 'results-overlay'
    this.overlayEl.style.cssText = `
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
      overflow-y: auto;
      padding: 20px;
    `

    // Reproducir fanfarria si desempeño alto
    try {
      if (audio && audio.fanfare && metrics.globalAccuracy >= 80) {
        audio.fanfare.currentTime = 0
        audio.fanfare.play().catch(() => {})
      }
    } catch (e) {}

    // Mostrar primera vista (niño)
    this.showChildView(() => {
      this.showEvaluatorView(metrics, adhd_alerts, onExport, audio)
    })

    document.body.appendChild(this.overlayEl)
  }

  /**
   * Vista para el niño: Felicitación y animación
   */
  private showChildView(
    onNext: () => void
  ): void {
    if (!this.overlayEl) return

    this.overlayEl.innerHTML = `
      <div style="
        text-align: center;
        max-width: 600px;
      ">
        <!-- Título -->
        <div style="
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #ffd700;
          text-shadow: 0 0 20px #ffd700;
          animation: pulse 1s infinite;
        ">
          🚀 ¡MISIÓN COMPLETADA!
        </div>

        <!-- Mensaje -->
        <div style="
          font-size: 24px;
          margin-bottom: 40px;
          color: #00ff00;
          line-height: 1.6;
        ">
          <div style="margin-bottom: 20px;">
            ¡Excelente trabajo, piloto espacial! 🌟
          </div>
          <div>
            Exploraste <strong>4 sectores galácticos</strong> y completaste tu misión.
          </div>
        </div>

        <!-- Imagen espacial (emoji) -->
        <div style="
          font-size: 80px;
          margin-bottom: 40px;
          animation: float 3s ease-in-out infinite;
        ">
          🛸✨
        </div>

        <!-- Botón siguiente -->
        <button id="btn-view-results" style="
          background: linear-gradient(135deg, #00ff00, #00dd00);
          color: #000;
          border: none;
          padding: 15px 40px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px #00ff00;
        ">
          VER RESULTADOS →
        </button>

        <!-- CSS animations -->
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        </style>
      </div>
    `

    const btnViewResults = document.getElementById('btn-view-results')
    if (btnViewResults) {
      btnViewResults.addEventListener('click', onNext)
    }

    // view state handled via DOM; no internal read-needed flag
  }

  /**
   * Vista para el evaluador: Métricas clínicas detalladas
   */
  private showEvaluatorView(
    metrics: SessionMetrics,
    adhd_alerts: string[],
    onExport?: (csv: string) => void,
    audio?: { fanfare?: HTMLAudioElement; buzz?: HTMLAudioElement }
  ): void {
    if (!this.overlayEl) return

    // Generar CSV si está disponible
    let csvData = ''
    if (onExport) {
      csvData = this.generateCSVData(metrics)
    }

    this.overlayEl.innerHTML = `
      <div style="
        max-width: 900px;
        width: 100%;
        background: rgba(0, 20, 40, 0.9);
        border: 2px solid #00ff00;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 0 40px rgba(0, 255, 0, 0.3);
      ">
        <!-- Encabezado -->
        <div style="
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #00ff00;
          padding-bottom: 15px;
        ">
          <h1 style="
            font-size: 24px;
            color: #00ff00;
            margin: 0 0 10px 0;
          ">
            📊 RESULTADOS DE EVALUACIÓN
          </h1>
          <p style="
            font-size: 14px;
            color: #aaa;
            margin: 0;
          ">
            El Guardián Espacial - Prueba Go/No-Go
          </p>
        </div>

        <!-- Resumen Global -->
        <div style="margin-bottom: 30px;">
          <h2 style="
            font-size: 16px;
            color: #ffd700;
            margin-top: 0;
            border-left: 4px solid #ffd700;
            padding-left: 10px;
          ">
            RESUMEN GLOBAL
          </h2>
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 10px;
          ">
            <tr style="background: rgba(0, 255, 0, 0.1);">
              <td style="padding: 8px; border: 1px solid #00ff00;">Precisión Global</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalAccuracy.toFixed(1)}%</strong></td>
              <td style="padding: 8px; border: 1px solid #00ff00;">Duración Total</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${(metrics.sessionDurationMs / 1000).toFixed(1)}s</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #00ff00;">RT Promedio</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalAvgRT.toFixed(0)}ms</strong></td>
              <td style="padding: 8px; border: 1px solid #00ff00;">Desv. Estándar RT</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalSdRT.toFixed(0)}ms</strong></td>
            </tr>
            <tr style="background: rgba(0, 255, 0, 0.1);">
              <td style="padding: 8px; border: 1px solid #00ff00;">Total Estímulos</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.totalStimuli}</strong> (${metrics.totalGo} Go / ${metrics.totalNoGo} NoGo)</td>
              <td style="padding: 8px; border: 1px solid #00ff00;">Errores Comisión</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalCommissionErrorRate.toFixed(1)}%</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #00ff00;">Respuestas Correctas</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalHits}</strong> hits / ${metrics.globalMisses} omisiones</td>
              <td style="padding: 8px; border: 1px solid #00ff00;">Rechazos Correctos</td>
              <td style="padding: 8px; border: 1px solid #00ff00; text-align: right;"><strong>${metrics.globalCorrectRejections}</strong> / ${metrics.globalFalseAlarms} false alarms</td>
            </tr>
          </table>
        </div>

        <!-- Rendimiento por Sector -->
        <div style="margin-bottom: 30px;">
          <h2 style="
            font-size: 16px;
            color: #ffd700;
            margin-top: 0;
            border-left: 4px solid #ffd700;
            padding-left: 10px;
          ">
            RENDIMIENTO POR SECTOR
          </h2>
          <table style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 10px;
          ">
            <thead>
              <tr style="background: rgba(0, 255, 0, 0.2);">
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: left;">Sector</th>
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: center;">Precisión</th>
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: center;">RT(ms)</th>
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: center;">SD</th>
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: center;">Omisiones</th>
                <th style="padding: 10px; border: 1px solid #00ff00; text-align: center;">Impulsivos</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.sectors
                .map(
                  (sector, idx) => `
                <tr style="background: ${idx % 2 === 0 ? 'rgba(0, 255, 0, 0.05)' : 'transparent'};">
                  <td style="padding: 8px; border: 1px solid #00ff00;"><strong>${sector.sectorNumber}</strong> (${this.getSectorName(sector.sectorNumber)})</td>
                  <td style="padding: 8px; border: 1px solid #00ff00; text-align: center;">${sector.accuracyPercent.toFixed(1)}%</td>
                  <td style="padding: 8px; border: 1px solid #00ff00; text-align: center;">${sector.avgReactionTimeMs.toFixed(0)}</td>
                  <td style="padding: 8px; border: 1px solid #00ff00; text-align: center;">${sector.sdReactionTimeMs.toFixed(0)}</td>
                  <td style="padding: 8px; border: 1px solid #00ff00; text-align: center;">${sector.misses}</td>
                  <td style="padding: 8px; border: 1px solid #00ff00; text-align: center;">${sector.falseAlarms}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Indicadores de Alerta TDAH -->
        ${
          adhd_alerts.length > 0
            ? `
          <div style="margin-bottom: 30px;">
            <h2 style="
              font-size: 16px;
              color: #ff6b6b;
              margin-top: 0;
              border-left: 4px solid #ff6b6b;
              padding-left: 10px;
            ">
              ⚠️ OBSERVACIONES CLÍNICAS
            </h2>
            <div style="
              background: rgba(255, 107, 107, 0.1);
              border: 1px solid #ff6b6b;
              border-radius: 6px;
              padding: 15px;
              font-size: 13px;
              line-height: 1.6;
            ">
              ${adhd_alerts.map(alert => `<div>⚠️ ${alert}</div>`).join('')}
              <div style="
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 107, 107, 0.3);
                font-size: 11px;
                color: #aaa;
              ">
                <strong>Nota:</strong> Estos indicadores son observacionales. No son diagnósticos clínicos. Se recomienda consulta con especialista para evaluación completa.
              </div>
            </div>
          </div>
        `
            : `
          <div style="
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            border-radius: 6px;
            padding: 15px;
            font-size: 13px;
            text-align: center;
            margin-bottom: 30px;
          ">
            ✓ El desempeño está dentro de parámetros típicos
          </div>
        `
        }

        <!-- Botones -->
        <div style="
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        ">
          ${
            csvData
              ? `
            <button id="btn-export-csv" style="
              background: linear-gradient(135deg, #0088ff, #0066dd);
              color: #fff;
              border: none;
              padding: 12px 25px;
              font-size: 14px;
              font-weight: bold;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 0 15px rgba(0, 136, 255, 0.5);
            ">
              📊 Exportar CSV
            </button>
          `
              : ''
          }
          <button id="btn-new-session" style="
            background: linear-gradient(135deg, #00ff00, #00dd00);
            color: #000;
            border: none;
            padding: 12px 25px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
          ">
            🔄 Nueva Sesión
          </button>
        </div>
      </div>
    `

    // Agregar event listeners
    const btnExportCSV = document.getElementById('btn-export-csv')
    if (btnExportCSV && csvData && onExport) {
      btnExportCSV.addEventListener('click', () => {
        this.downloadCSV(csvData)
      })
    }

    const btnNewSession = document.getElementById('btn-new-session')
    if (btnNewSession) {
      btnNewSession.addEventListener('click', () => {
        location.reload()
      })
    }

    // view state handled via DOM; no internal read-needed flag
    // Reproducir sonido de éxito o alerta según métricas
    try {
      if (audio && audio.fanfare && metrics.globalAccuracy >= 80) {
        audio.fanfare.currentTime = 0
        audio.fanfare.play().catch(() => {})
      } else if (audio && audio.buzz && metrics.globalAccuracy < 60) {
        audio.buzz.currentTime = 0
        audio.buzz.play().catch(() => {})
      }
    } catch (e) {}
  }

  /**
   * Genera datos CSV a partir de las métricas
   */
  private generateCSVData(metrics: SessionMetrics): string {
    // Encabezado
    const headers = [
      'metric_name',
      'value',
      'unit'
    ].join(',')

    const rows: string[] = []

    // Resumen global
    rows.push(`Global Accuracy,${metrics.globalAccuracy.toFixed(1)},%`)
    rows.push(`Global Avg RT,${metrics.globalAvgRT.toFixed(2)},ms`)
    rows.push(`Global Median RT,${metrics.globalMedianRT.toFixed(2)},ms`)
    rows.push(`Global SD RT,${metrics.globalSdRT.toFixed(2)},ms`)
    rows.push(`Global Hits,${metrics.globalHits},count`)
    rows.push(`Global Misses,${metrics.globalMisses},count`)
    rows.push(`Global False Alarms,${metrics.globalFalseAlarms},count`)
    rows.push(`Global Correct Rejections,${metrics.globalCorrectRejections},count`)
    rows.push(`Commission Error Rate,${metrics.globalCommissionErrorRate.toFixed(1)},%`)
    rows.push(`Total Stimuli,${metrics.totalStimuli},count`)
    rows.push(`Total Go,${metrics.totalGo},count`)
    rows.push(`Total NoGo,${metrics.totalNoGo},count`)
    rows.push(`Session Duration,${(metrics.sessionDurationMs / 1000).toFixed(1)},seconds`)
    rows.push('')

    // Métricas por sector
    rows.push('Sector,Accuracy(%),AvgRT(ms),SD(ms),Hits,Misses,FalseAlarms,CorrectRejections')
    for (const sector of metrics.sectors) {
      rows.push(
        `${sector.sectorNumber},${sector.accuracyPercent.toFixed(1)},${sector.avgReactionTimeMs.toFixed(2)},${sector.sdReactionTimeMs.toFixed(2)},${sector.hits},${sector.misses},${sector.falseAlarms},${sector.correctRejections}`
      )
    }

    return [headers, ...rows].join('\n')
  }

  /**
   * Descarga el archivo CSV
   */
  private downloadCSV(csvData: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `Guardian_Espacial_Resultados_${timestamp}.csv`

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log(`[ResultsScreen] Descargado: ${filename}`)
  }

  /**
   * Obtiene nombre del sector por número
   */
  private getSectorName(sectorNumber: number): string {
    const names = [
      'Nebulosa Polar',
      'Cinturón de Asteria',
      'Cuadrante Lyra',
      'Fosa Abismal'
    ]
    return names[sectorNumber - 1] || 'Desconocido'
  }

  /**
   * Limpia la pantalla de resultados
   */
  public hide(): void {
    if (this.overlayEl && this.overlayEl.parentElement) {
      this.overlayEl.parentElement.removeChild(this.overlayEl)
      this.overlayEl = null
    }
  }

  /**
   * Destruye la pantalla
   */
  public destroy(): void {
    this.hide()
  }
}
