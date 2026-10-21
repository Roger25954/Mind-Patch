/* ══════════════════════════════════════════════
   state.js · Estado global del juego
   ══════════════════════════════════════════════ */

const GameState = {

  /* ── Sesión actual ── */
  sesionId: Date.now(),
  jugador: 'Aprendiz',
  iniciado: new Date().toISOString(),

  /* ── Resultados por subprueba ── */
  resultados: {
    letras: [],   // { par, respuesta, correcto, tiempoMs }
    palabras: [],   // { texto, tipo, respuesta, correcto, tiempoMs, agotado }
    oraciones: [],   // { id, instruccion, correcto, erroresParciales, tiempoMs }
  },

  /* ── Progreso de la sesión ── */
  completado: {
    letras: false,
    palabras: false,
    oraciones: false,
  },

  /* ── Métodos utilitarios ── */

  registrarLetra(par, respuesta, correcto, tiempoMs) {
    this.resultados.letras.push({
      pair_shown: par.a + '-' + par.b,   // NUEVO: qué letras eran
      igual_correcto: par.igual,          // NUEVO: respuesta correcta
      respuesta,                          // ya lo tenías
      correcto,
      tiempoMs,
    });
  },

  registrarPalabra(texto, tipo, frecuencia, respuesta, correcto, tiempoMs, agotado = false) {
    this.resultados.palabras.push({ texto, tipo, frecuencia, respuesta, correcto, tiempoMs, agotado });
  },

  registrarOracion(id, instruccion, tipo, correcto, erroresParciales, tiempoMs, firstActionMs) {
    this.resultados.oraciones.push({ id, instruccion, tipo, correcto, erroresParciales, tiempoMs, firstActionMs });
  },

  /**
   * Calcula métricas para una subprueba dada.
   * @param {'letras'|'palabras'|'oraciones'} prueba
   * @returns {Object} métricas calculadas
   */
  metricas(prueba) {
    const arr = this.resultados[prueba];
    if (!arr || arr.length === 0) return null;

    const total = arr.length;
    const correctos = arr.filter(r => r.correcto).length;
    const errores = total - correctos;
    const precision = (correctos / total) * 100;
    const tasaError = (errores / total) * 100;   // E_tasa

    const tiempos = arr.map(r => r.tiempoMs).filter(Boolean);
    const velMedia = tiempos.length
      ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
      : 0;

    const velMin = tiempos.length ? Math.min(...tiempos) : 0;
    const velMax = tiempos.length ? Math.max(...tiempos) : 0;

    // Específico por prueba
    let extra = {};

    if (prueba === 'palabras') {
      const reales = arr.filter(r => r.tipo === 'real');
      const pseudos = arr.filter(r => r.tipo === 'pseudo');
      const agotados = arr.filter(r => r.agotado).length;

      const precisionReales = reales.length ? reales.filter(r => r.correcto).length / reales.length * 100 : 0;
      const precisionPseudos = pseudos.length ? pseudos.filter(r => r.correcto).length / pseudos.length * 100 : 0;

      // NUEVO: velocidad separada por tipo
      const velReales = reales.filter(r => r.tiempoMs).map(r => r.tiempoMs);
      const velPseudos = pseudos.filter(r => r.tiempoMs).map(r => r.tiempoMs);

      extra = {
        precisionReales: +precisionReales.toFixed(1),
        precisionPseudos: +precisionPseudos.toFixed(1),
        disociacion: +(precisionReales - precisionPseudos).toFixed(1), // NUEVO — el más importante
        velMediaReales: velReales.length ? +(velReales.reduce((a, b) => a + b, 0) / velReales.length).toFixed(0) : 0,
        velMediaPseudos: velPseudos.length ? +(velPseudos.reduce((a, b) => a + b, 0) / velPseudos.length).toFixed(0) : 0,
        respuestasAgotadas: agotados,
      };
    }

    if (prueba === 'letras') {
      const errores_arr = arr.filter(r => !r.correcto);

      // Agrupar errores por pair_shown
      const conteo_pares = {};
      errores_arr.forEach(r => {
        conteo_pares[r.pair_shown] = (conteo_pares[r.pair_shown] || 0) + 1;
      });

      // Ver si hay un par que domina los errores
      const par_dominante = Object.entries(conteo_pares).sort((a, b) => b[1] - a[1])[0];
      const es_sistematico = par_dominante && errores_arr.length > 0
        ? (par_dominante[1] / errores_arr.length) > 0.6
        : false;

      extra = {
        sesgoIgual: arr.filter(r => r.respuesta === true).length,
        sesgoDifer: arr.filter(r => r.respuesta === false).length,
        patron_confusion: conteo_pares,       // NUEVO: {"bpal-bpal": 2, "pqbd-pqdb": 3}
        par_sistematico: es_sistematico ? par_dominante[0] : null,  // NUEVO: "pqbd-pqdb" o null
      };
    }

    return {
      total, correctos, errores,
      precision: +precision.toFixed(1),
      tasaError: +tasaError.toFixed(1),
      velMedia: +velMedia.toFixed(0),
      velMin, velMax,
      ...extra,
    };
  },

  /**
   * Exporta resultados como JSON descargable.
   */
  exportarJSON() {
    const payload = {
      sesionId: this.sesionId,
      jugador: this.jugador,
      iniciado: this.iniciado,
      finalizado: new Date().toISOString(),
      metricas: {
        letras: this.metricas('letras'),
        palabras: this.metricas('palabras'),
        oraciones: this.metricas('oraciones'),
      },
      rawResultados: this.resultados,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prolec-r_${this.sesionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  reset() {
    this.resultados = { letras: [], palabras: [], oraciones: [] };
    this.completado = { letras: false, palabras: false, oraciones: false };
    this.sesionId = Date.now();
    this.iniciado = new Date().toISOString();
  },
};