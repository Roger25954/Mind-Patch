/* ══════════════════════════════════════════════
   state.js · Estado global del juego
   ══════════════════════════════════════════════ */

const GameState = {

  /* ── Sesión actual ── */
  sesionId:    Date.now(),
  jugador:     'Aprendiz',
  iniciado:    new Date().toISOString(),

  /* ── Resultados por subprueba ── */
  resultados: {
    letras:    [],   // { par, respuesta, correcto, tiempoMs }
    palabras:  [],   // { texto, tipo, respuesta, correcto, tiempoMs, agotado }
    oraciones: [],   // { id, instruccion, correcto, erroresParciales, tiempoMs }
  },

  /* ── Progreso de la sesión ── */
  completado: {
    letras:    false,
    palabras:  false,
    oraciones: false,
  },

  /* ── Métodos utilitarios ── */

  registrarLetra(par, respuesta, correcto, tiempoMs) {
    this.resultados.letras.push({ par, respuesta, correcto, tiempoMs });
  },

  registrarPalabra(texto, tipo, respuesta, correcto, tiempoMs, agotado = false) {
    this.resultados.palabras.push({ texto, tipo, respuesta, correcto, tiempoMs, agotado });
  },

  registrarOracion(id, instruccion, correcto, erroresParciales, tiempoMs) {
    this.resultados.oraciones.push({ id, instruccion, correcto, erroresParciales, tiempoMs });
  },

  /**
   * Calcula métricas para una subprueba dada.
   * @param {'letras'|'palabras'|'oraciones'} prueba
   * @returns {Object} métricas calculadas
   */
  metricas(prueba) {
    const arr = this.resultados[prueba];
    if (!arr || arr.length === 0) return null;

    const total      = arr.length;
    const correctos  = arr.filter(r => r.correcto).length;
    const errores    = total - correctos;
    const precision  = (correctos / total) * 100;
    const tasaError  = (errores / total) * 100;   // E_tasa

    const tiempos = arr.map(r => r.tiempoMs).filter(Boolean);
    const velMedia = tiempos.length
      ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
      : 0;

    const velMin = tiempos.length ? Math.min(...tiempos) : 0;
    const velMax = tiempos.length ? Math.max(...tiempos) : 0;

    // Específico por prueba
    let extra = {};

    if (prueba === 'palabras') {
      const reales   = arr.filter(r => r.tipo === 'real');
      const pseudos  = arr.filter(r => r.tipo === 'pseudo');
      const agotados = arr.filter(r => r.agotado).length;
      extra = {
        precisionReales:  reales.length  ? (reales.filter(r => r.correcto).length  / reales.length  * 100) : 0,
        precisionPseudos: pseudos.length ? (pseudos.filter(r => r.correcto).length / pseudos.length * 100) : 0,
        respuestasAgotadas: agotados,
      };
    }

    if (prueba === 'letras') {
      const iguales = arr.filter(r => r.par && r.par.includes('igual'));
      extra = {
        sesgoIgual: arr.filter(r => r.respuesta === true).length,
        sesgoDifer: arr.filter(r => r.respuesta === false).length,
      };
    }

    return {
      total, correctos, errores,
      precision: +precision.toFixed(1),
      tasaError:  +tasaError.toFixed(1),
      velMedia:   +velMedia.toFixed(0),
      velMin, velMax,
      ...extra,
    };
  },

  /**
   * Exporta resultados como JSON descargable.
   */
  exportarJSON() {
    const payload = {
      sesionId:  this.sesionId,
      jugador:   this.jugador,
      iniciado:  this.iniciado,
      finalizado: new Date().toISOString(),
      metricas: {
        letras:    this.metricas('letras'),
        palabras:  this.metricas('palabras'),
        oraciones: this.metricas('oraciones'),
      },
      rawResultados: this.resultados,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `prolec-r_${this.sesionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  reset() {
    this.resultados  = { letras: [], palabras: [], oraciones: [] };
    this.completado  = { letras: false, palabras: false, oraciones: false };
    this.sesionId    = Date.now();
    this.iniciado    = new Date().toISOString();
  },
};