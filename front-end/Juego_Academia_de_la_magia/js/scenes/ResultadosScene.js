class ResultadosScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultadosScene' }); }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, 0x06060a);
    DrawHelper.bordeSala(this, PALETTE.goldDim, 0.5);

    // Header
    this.add.rectangle(W/2, 50, W, 84, 0x09090f);
    this.add.graphics().lineStyle(1, PALETTE.goldDim, 0.4).strokeRect(0, 90, W, 1);

    const todo = GameState.completado.letras && GameState.completado.palabras && GameState.completado.oraciones;
    this.add.text(W/2, 50, '✦  Informe de la Academia  ✦', { ...TEXT_STYLES.title, fontSize: '34px' }).setOrigin(0.5);
    if (todo) {
      this.add.text(W - 48, 50, '★ GRADUADO', {
        fontFamily: FONTS.display, fontSize: '15px', color: '#c9a84c',
        backgroundColor: '#12100a', padding: { x: 10, y: 5 },
      }).setOrigin(1, 0.5);
    }

    // Tres paneles de métricas
    const secciones = [
      { key: 'letras',    titulo: 'Sala de los Espejos — Letras',       color: '#7ec8e3', borderColor: 0x2a6a88, bgColor: 0x060c12, y: 106 },
      { key: 'palabras',  titulo: 'Clase de Pociones — Palabras',        color: '#88ffcc', borderColor: 0x2a7755, bgColor: 0x060c08, y: 384 },
      { key: 'oraciones', titulo: 'Sala de Entrenamiento — Oraciones',   color: '#ffcc88', borderColor: 0x885522, bgColor: 0x0c0804, y: 570 },
    ];

    secciones.forEach(s => this._dibujarSeccion(s, W));

    // Fórmula
    const frmY = H - 74;
    this.add.graphics().lineStyle(1, PALETTE.goldDim, 0.18).strokeRect(40, frmY - 8, W - 80, 32);
    this.add.text(W/2, frmY + 8,
      'E_tasa = (Errores / Total) × 100   ·   Velocidad = promedio de tiempos de respuesta (ms)',
      { ...TEXT_STYLES.bodySmall, color: '#1e1528', fontSize: '16px' }
    ).setOrigin(0.5);

    // Botones
    const btnY = H - 32;
    DrawHelper.botonMagico(this, W/2 - 210, btnY, 340, 46, '← Volver a la Academia', 0x09090f, '#7755bb', () => {
      this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
    });
    DrawHelper.botonMagico(this, W/2 + 210, btnY, 340, 46, '↓ Exportar JSON', 0x090f09, '#66ffaa', () => GameState.exportarJSON());

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  _dibujarSeccion(s, W) {
    const m       = GameState.metricas(s.key);
    const panelH  = s.key === 'palabras' ? 172 : 122;
    const panelY  = s.y + panelH / 2;

    // Fondo del panel
    this.add.rectangle(W/2, panelY, W - 60, panelH, s.bgColor);
    this.add.graphics()
      .lineStyle(1, s.borderColor, 0.6)
      .strokeRect(30, s.y, W - 60, panelH);

    this.add.text(48, s.y + 14, s.titulo, { ...TEXT_STYLES.headerRoom, fontSize: '17px', color: s.color });

    if (!m || m.total === 0) {
      const msg = GameState.completado[s.key] ? 'Sin datos registrados' : '— Prueba no realizada —';
      this.add.text(W/2, panelY + 12, msg, { ...TEXT_STYLES.bodySmall, color: '#2a1a35', fontStyle: 'italic' }).setOrigin(0.5);
      return;
    }

    const cols = this._getCols(s.key, m);
    const colW = (W - 80) / cols.length;

    cols.forEach((c, i) => {
      const cx = 40 + i * colW + colW / 2;
      const vy = panelY + (s.key === 'palabras' ? 20 : 12);
      this.add.text(cx, vy, c.val, {
        fontFamily: FONTS.display, fontSize: '26px', color: s.color,
      }).setOrigin(0.5);
      this.add.text(cx, vy + 34, c.label, {
        ...TEXT_STYLES.bodySmall, color: '#2a1a3a', fontSize: '14px',
      }).setOrigin(0.5);

      // Columna divisora sutil
      if (i < cols.length - 1) {
        this.add.graphics().lineStyle(1, s.borderColor, 0.1)
          .strokeRect(40 + (i + 1) * colW, s.y + 10, 1, panelH - 20);
      }
    });

    // Barra de precisión
    const barY = s.y + panelH - 18;
    const barW = W - 120;
    this.add.rectangle(W/2, barY, barW, 7, 0x0d0d18);
    const pct       = m.precision / 100;
    const fillColor = pct >= 0.8 ? 0x4a9966 : pct >= 0.5 ? 0xcc9933 : 0xaa2233;
    if (pct > 0) {
      this.add.rectangle(W/2 - barW/2 + (barW * pct) / 2, barY, barW * pct, 7, fillColor);
    }
    this.add.text(W/2 + barW/2 + 12, barY, `${m.precision}%`, {
      ...TEXT_STYLES.bodySmall, color: '#2a1a35', fontSize: '15px',
    }).setOrigin(0, 0.5);
  }

  _getCols(key, m) {
    const base = [
      { label: 'TOTAL ÍTEMS', val: String(m.total) },
      { label: 'CORRECTOS',   val: String(m.correctos) },
      { label: 'ERRORES',     val: String(m.errores) },
      { label: 'PRECISIÓN',   val: m.precision + '%' },
      { label: 'E_TASA',      val: m.tasaError + '%' },
      { label: 'VEL. MEDIA',  val: m.velMedia + 'ms' },
    ];
    if (key === 'palabras' && m.precisionReales !== undefined) {
      return [
        ...base,
        { label: 'PREC. REALES',  val: m.precisionReales.toFixed(1)  + '%' },
        { label: 'PREC. PSEUDOS', val: m.precisionPseudos.toFixed(1) + '%' },
        { label: 'AGOTADOS',      val: String(m.respuestasAgotadas) },
      ];
    }
    return base;
  }
}