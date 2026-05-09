class ResultadosScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultadosScene' }); }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, 0x06060a);
    DrawHelper.bordeSala(this, PALETTE.goldDim, 0.5);

    // ── Header ──────────────────────────────────────────────
    this.add.rectangle(W / 2, 50, W, 84, 0x09090f);
    this.add.graphics().lineStyle(1, PALETTE.goldDim, 0.4).strokeRect(0, 90, W, 1);

    const todo = GameState.completado.letras && GameState.completado.palabras && GameState.completado.oraciones;
    this.add.text(W / 2, 50, '✦  Informe de la Academia  ✦', { ...TEXT_STYLES.title, fontSize: '34px' }).setOrigin(0.5);
    if (todo) {
      this.add.text(W - 48, 50, '★ GRADUADO', {
        fontFamily: FONTS.display, fontSize: '15px', color: '#c9a84c',
        backgroundColor: '#12100a', padding: { x: 10, y: 5 },
      }).setOrigin(1, 0.5);
    }

    // ── Paneles de métricas — posición dinámica ─────────────
    const definiciones = [
      { key: 'letras',    titulo: 'Sala de los Espejos — Letras',       color: '#7ec8e3', borderColor: 0x2a6a88, bgColor: 0x060c12 },
      { key: 'palabras',  titulo: 'Clase de Pociones — Palabras',        color: '#88ffcc', borderColor: 0x2a7755, bgColor: 0x060c08 },
      { key: 'oraciones', titulo: 'Sala de Entrenamiento — Oraciones',   color: '#ffcc88', borderColor: 0x885522, bgColor: 0x0c0804 },
    ];

    const GAP = 10;          // espacio entre paneles
    let currentY = 100;      // donde empieza el primer panel (bajo el header)

    definiciones.forEach(def => {
      const panelH = this._getPanelH(def.key);
      this._dibujarSeccion({ ...def, y: currentY }, W);
      currentY += panelH + GAP;
    });

    // ── Fórmula ─────────────────────────────────────────────
    const frmY = H - 74;
    this.add.graphics().lineStyle(1, PALETTE.goldDim, 0.18).strokeRect(40, frmY - 8, W - 80, 32);
    this.add.text(W / 2, frmY + 8,
      'E_tasa = (Errores / Total) × 100   ·   Velocidad = promedio de tiempos de respuesta (ms)',
      { ...TEXT_STYLES.bodySmall, color: '#1e1528', fontSize: '16px' }
    ).setOrigin(0.5);

    // ── Botones ──────────────────────────────────────────────
    const btnY = H - 32;
    DrawHelper.botonMagico(this, W / 2 - 210, btnY, 340, 46, '← Volver a la Academia', 0x09090f, '#7755bb', () => {
      this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
    DrawHelper.botonMagico(this, W / 2 + 210, btnY, 340, 46, '↓ Exportar JSON', 0x090f09, '#66ffaa', () => GameState.exportarJSON());

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  // ── Altura de cada panel según cuántas filas de datos tiene ──
  _getPanelH(key) {
    if (key === 'palabras') return 210;   // 12 columnas → dos filas de valores
    if (key === 'letras')   return 150;   // 6 columnas + sesgo/patrón
    return 140;                            // oraciones
  }

  // ── Dibuja un panel completo ─────────────────────────────
  _dibujarSeccion(s, W) {
    const m      = GameState.metricas(s.key);
    const panelH = this._getPanelH(s.key);
    const panelY = s.y + panelH / 2;

    // Fondo
    this.add.rectangle(W / 2, panelY, W - 60, panelH, s.bgColor);
    this.add.graphics()
      .lineStyle(1, s.borderColor, 0.6)
      .strokeRect(30, s.y, W - 60, panelH);

    // Título de sala
    this.add.text(48, s.y + 14, s.titulo, { ...TEXT_STYLES.headerRoom, fontSize: '17px', color: s.color });

    // Sin datos
    if (!m || m.total === 0) {
      const msg = GameState.completado[s.key] ? 'Sin datos registrados' : '— Prueba no realizada —';
      this.add.text(W / 2, panelY + 12, msg, { ...TEXT_STYLES.bodySmall, color: '#2a1a35', fontStyle: 'italic' }).setOrigin(0.5);
      return;
    }

    const cols = this._getCols(s.key, m);

    // Para palabras hacemos dos filas de columnas (6 + 6) para no aplastar los textos
    if (s.key === 'palabras' && cols.length > 6) {
      this._dibujarFilas(s, W, panelH, panelY, cols);
    } else {
      this._dibujarFila(s, W, panelH, panelY, cols, panelY);
    }

    // ── Barra de precisión ───────────────────────────────────
    const barY      = s.y + panelH - 14;
    const barW      = W - 120;
    const pct       = m.precision / 100;
    const fillColor = pct >= 0.8 ? 0x4a9966 : pct >= 0.5 ? 0xcc9933 : 0xaa2233;

    this.add.rectangle(W / 2, barY, barW, 7, 0x0d0d18);
    if (pct > 0) {
      this.add.rectangle(W / 2 - barW / 2 + (barW * pct) / 2, barY, barW * pct, 7, fillColor);
    }
    this.add.text(W / 2 + barW / 2 + 12, barY, `${m.precision}%`, {
      ...TEXT_STYLES.bodySmall, color: '#2a1a35', fontSize: '15px',
    }).setOrigin(0, 0.5);
  }

  // ── Fila única de columnas (letras / oraciones) ──────────
  _dibujarFila(s, W, panelH, panelY, cols, cy) {
    const colW = (W - 80) / cols.length;
    cols.forEach((c, i) => {
      const cx = 40 + i * colW + colW / 2;
      const vy = cy + 12;
      this.add.text(cx, vy, c.val, {
        fontFamily: FONTS.display, fontSize: '24px', color: s.color,
      }).setOrigin(0.5);
      this.add.text(cx, vy + 32, c.label, {
        ...TEXT_STYLES.bodySmall, color: '#2a1a3a', fontSize: '13px',
      }).setOrigin(0.5);
      if (i < cols.length - 1) {
        this.add.graphics().lineStyle(1, s.borderColor, 0.1)
          .strokeRect(40 + (i + 1) * colW, s.y + 10, 1, panelH - 24);
      }
    });
  }

  // ── Dos filas de columnas para palabras (6 + 6) ──────────
  _dibujarFilas(s, W, panelH, panelY, cols,m) {
    const mitad  = Math.ceil(cols.length / 2);
    const fila1  = cols.slice(0, mitad);
    const fila2  = cols.slice(mitad);

    // Línea separadora entre filas
    const lineY = s.y + panelH / 2 - 4;
    this.add.graphics().lineStyle(1, s.borderColor, 0.15).strokeRect(40, lineY, W - 80, 1);

    const colW1 = (W - 80) / fila1.length;
    const colW2 = (W - 80) / fila2.length;

    // Fila 1 — parte superior del panel
    const cy1 = s.y + 42;
    fila1.forEach((c, i) => {
      const cx = 40 + i * colW1 + colW1 / 2;
      this.add.text(cx, cy1, c.val, {
        fontFamily: FONTS.display, fontSize: '22px', color: s.color,
      }).setOrigin(0.5);
      this.add.text(cx, cy1 + 28, c.label, {
        ...TEXT_STYLES.bodySmall, color: '#2a1a3a', fontSize: '12px',
      }).setOrigin(0.5);
      if (i < fila1.length - 1) {
        this.add.graphics().lineStyle(1, s.borderColor, 0.08)
          .strokeRect(40 + (i + 1) * colW1, s.y + 30, 1, panelH / 2 - 30);
      }
    });

    // Fila 2 — parte inferior del panel
    const cy2 = lineY + 38;
    fila2.forEach((c, i) => {
      const cx = 40 + i * colW2 + colW2 / 2;

      // Color especial para disociación según su valor
      let color = s.color;
      if (c.key === 'disociacion' && m) {
        color = m.disociacion >= 20 ? '#ff6655' : m.disociacion >= 10 ? '#ffcc44' : '#66ffaa';
      }

      this.add.text(cx, cy2, c.val, {
        fontFamily: FONTS.display, fontSize: '22px', color,
      }).setOrigin(0.5);
      this.add.text(cx, cy2 + 28, c.label, {
        ...TEXT_STYLES.bodySmall, color: '#2a1a3a', fontSize: '12px',
      }).setOrigin(0.5);
      if (i < fila2.length - 1) {
        this.add.graphics().lineStyle(1, s.borderColor, 0.08)
          .strokeRect(40 + (i + 1) * colW2, lineY + 8, 1, panelH / 2 - 20);
      }
    });
  }

  // ── Columnas por subprueba ───────────────────────────────
  _getCols(key, m) {
    // Base común a las 3 salas
    const base = [
      { label: 'TOTAL ÍTEMS', val: String(m.total) },
      { label: 'CORRECTOS',   val: String(m.correctos) },
      { label: 'ERRORES',     val: String(m.errores) },
      { label: 'PRECISIÓN',   val: m.precision + '%' },
      { label: 'E_TASA',      val: m.tasaError + '%' },
      { label: 'VEL. MEDIA',  val: m.velMedia + 'ms' },
    ];

    // ── Letras: añadir sesgo y patrón de confusión ──────────
    if (key === 'letras') {
      const extra = [];
      if (m.sesgoIgual !== undefined) {
        extra.push({ label: 'RESP. IGUALES', val: String(m.sesgoIgual) });
        extra.push({ label: 'RESP. DIFER.',  val: String(m.sesgoDifer) });
      }
      if (m.par_sistematico) {
        extra.push({ label: 'PAR CONFUNDIDO', val: m.par_sistematico });
      } else if (m.par_sistematico === null && m.errores > 0) {
        extra.push({ label: 'PAR CONFUNDIDO', val: 'aleatorio' });
      }
      return [...base, ...extra];
    }

    // ── Palabras: fila 1 = base, fila 2 = diagnóstico ───────
    if (key === 'palabras' && m.precisionReales !== undefined) {
      const disocStr = m.disociacion !== undefined
        ? (m.disociacion > 0 ? '+' : '') + m.disociacion + 'pts'
        : '—';

      return [
        ...base,
        { key: 'precReales',  label: 'PREC. REALES',  val: m.precisionReales.toFixed(1)  + '%' },
        { key: 'precPseudos', label: 'PREC. PSEUDOS', val: m.precisionPseudos.toFixed(1) + '%' },
        { key: 'disociacion', label: 'DISOCIACIÓN',   val: disocStr },
        { key: 'velReales',   label: 'VEL. REALES',   val: (m.velMediaReales  ?? '—') + 'ms' },
        { key: 'velPseudos',  label: 'VEL. PSEUDOS',  val: (m.velMediaPseudos ?? '—') + 'ms' },
        { key: 'agotados',    label: 'AGOTADOS',       val: String(m.respuestasAgotadas ?? 0) },
      ];
    }

    // ── Oraciones: añadir latencia de comprensión ───────────
    if (key === 'oraciones') {
      const extra = [];
      if (m.firstActionMedia !== undefined) {
        extra.push({ label: 'LATENCIA COMP.', val: m.firstActionMedia + 'ms' });
      }
      if (m.erroresParciales !== undefined) {
        extra.push({ label: 'ERR. PARCIALES', val: String(m.erroresParciales) });
      }
      return [...base, ...extra];
    }

    return base;
  }
}