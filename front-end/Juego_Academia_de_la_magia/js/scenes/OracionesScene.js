class OracionesScene extends Phaser.Scene {
  constructor() { super({ key: 'OracionesScene' }); }

  init() {
    this._items            = Phaser.Utils.Array.Shuffle([...DATA.oraciones]);
    this._idx              = 0;
    this._secuencia        = [];
    this._erroresParciales = 0;
    this._bloqueado        = false;
    this._tiempoInicio     = 0;
    this._objGroup         = [];
    this._pasoIndicadores  = [];
  }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, 0x0e0608);
    // Suelo de piedra
    this.add.rectangle(W/2, H - 24, W, 48, 0x100808);
    this.add.graphics().lineStyle(1, 0x3a1a0a, 0.4).strokeRect(0, H - 48, W, 1);
    // Antorchas decorativas
    this._dibujarAntorcha(80, H - 80);
    this._dibujarAntorcha(W - 80, H - 80);

    DrawHelper.bordeSala(this, 0x6a3322, 0.5);
    const { progressText } = DrawHelper.headerSala(this, 'Sala de Entrenamiento', '⚔', '#ffcc88');
    this._progressText = progressText;

    // Panel instrucción
    const instrY = 170;
    DrawHelper.panelPergamino(this, W/2, instrY, W - 100, 90);
    this.add.text(W/2, instrY - 32, 'INSTRUCCIÓN MÁGICA', {
      ...TEXT_STYLES.label, color: '#4a2a1a', fontSize: '15px',
    }).setOrigin(0.5);
    this._instruccionText = this.add.text(W/2, instrY + 8, '', {
      ...TEXT_STYLES.instruction, fontSize: '24px', color: '#e8d4c0',
      wordWrap: { width: W - 160 },
    }).setOrigin(0.5);

    // Indicadores de pasos (fila de círculos)
    this._pasoIndicadoresY = instrY + 60;

    // Zona de objetos
    this._zonaY = H / 2 + 60;

    // Feedback
    this._feedbackText = this.add.text(W/2, H - 68, '', { ...TEXT_STYLES.feedback_ok }).setOrigin(0.5);
    this._pistaText    = this.add.text(W/2, H - 38, '', { ...TEXT_STYLES.bodySmall, color: '#3a1a0a', fontStyle: 'italic', fontSize: '18px' }).setOrigin(0.5);

    this._mostrarItem();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _dibujarAntorcha(x, y) {
    const g = this.add.graphics().setAlpha(0.3);
    g.fillStyle(0x5a3010); g.fillRect(x - 5, y - 40, 10, 44);
    g.fillStyle(0xffaa00, 0.9); g.fillTriangle(x, y - 70, x - 14, y - 40, x + 14, y - 40);
    g.fillStyle(0xff6600, 0.7); g.fillTriangle(x - 4, y - 60, x - 10, y - 40, x + 10, y - 40);
    g.fillStyle(0xffee88, 0.5); g.fillTriangle(x, y - 58, x - 6, y - 42, x + 6, y - 42);
    // Luz ambiental
    const glow = this.add.circle(x, y - 55, 55, 0xff8800, 0.04).setAlpha(0.3);
    this.tweens.add({ targets: glow, alpha: { from: 0.3, to: 0.1 }, scaleX: { from: 1, to: 1.2 }, scaleY: { from: 1, to: 1.3 }, duration: 600, yoyo: true, repeat: -1 });
  }

  _mostrarItem() {
    if (this._idx >= this._items.length) { this._terminar(); return; }
    const item = this._items[this._idx];
    this._secuencia        = [];
    this._erroresParciales = 0;
    this._bloqueado        = false;
    this._tiempoInicio     = Date.now();

    this._objGroup.forEach(o => o.destroy());
    this._objGroup = [];
    this._pasoIndicadores.forEach(p => p.destroy());
    this._pasoIndicadores = [];

    this._progressText.setText(`${this._idx + 1} / ${this._items.length}`);
    this._instruccionText.setAlpha(0).setText(item.instruccion);
    this.tweens.add({ targets: this._instruccionText, alpha: 1, duration: 340 });

    this._feedbackText.setText('');
    this._pistaText.setText('Toca los objetos según indica la instrucción');

    this._crearIndicadoresPasos(item);
    this._crearObjetos(item);
  }

  _crearIndicadoresPasos(item) {
    const { width: W } = this.scale;
    const total  = item.secuencia.length;
    const sepX   = 80;
    const startX = W/2 - (total - 1) * sepX / 2;
    const cy     = this._pasoIndicadoresY;

    if (total > 1) {
      const lg = this.add.graphics();
      lg.lineStyle(1.5, PALETTE.ember, 0.18);
      for (let i = 0; i < total - 1; i++) {
        lg.beginPath();
        lg.moveTo(startX + i * sepX + 22, cy);
        lg.lineTo(startX + (i + 1) * sepX - 22, cy);
        lg.strokePath();
      }
      this._pasoIndicadores.push(lg);
    }

    item.secuencia.forEach((_, i) => {
      const cx = startX + i * sepX;
      const circle = this.add.circle(cx, cy, 18, 0x1a0a08);
      circle.setStrokeStyle(1.5, PALETTE.ember, 0.35);
      const num = this.add.text(cx, cy, `${i + 1}`, {
        ...TEXT_STYLES.bodySmall, color: '#3a1a0a', fontSize: '18px',
      }).setOrigin(0.5);
      this._pasoIndicadores.push(circle, num);
    });
  }

  _crearObjetos(item) {
    const { width: W } = this.scale;
    const objs  = item.objetos;
    const sepX  = objs.length === 2 ? 360 : 240;
    const startX = W/2 - (objs.length - 1) * sepX / 2;
    const cy    = this._zonaY;

    objs.forEach((obj) => {
      const cx = startX + objs.indexOf(obj) * sepX;

      // Pedestal ornamental
      const ped = this.add.graphics();
      ped.fillStyle(0x1a0c0a, 0.9);
      ped.fillRoundedRect(cx - 72, cy + 88, 144, 24, 5);
      ped.lineStyle(1, 0x4a2a1a, 0.5);
      ped.strokeRoundedRect(cx - 72, cy + 88, 144, 24, 5);
      // Columna del pedestal
      ped.fillStyle(0x160a08, 0.7);
      ped.fillRect(cx - 10, cy + 78, 20, 14);

      // Aura de color detrás del objeto
      const aura = this.add.circle(cx, cy, 68, obj.color, 0.06);

      // Glyph del objeto
      const g = this.add.graphics();
      DrawHelper.dibujarGlyph(g, obj.glyph, cx, cy, obj.color, 1);

      // Etiqueta
      const lbl = this.add.text(cx, cy + 100, obj.label.toUpperCase(), {
        ...TEXT_STYLES.label, color: '#4a2a1a', fontSize: '14px',
      }).setOrigin(0.5);

      // Hit area
      const hit = this.add.rectangle(cx, cy, 150, 180, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hit.on('pointerover', () => {
        this.tweens.add({ targets: [g, aura], y: '-=8', duration: 140, ease: 'Sine.Out' });
        aura.setAlpha(0.14);
      });
      hit.on('pointerout', () => {
        this.tweens.add({ targets: [g, aura], y: '+=8', duration: 140, ease: 'Sine.In' });
        aura.setAlpha(0.06);
      });
      hit.on('pointerdown', () => {
        if (this._bloqueado) return;
        this.tweens.add({ targets: g, scaleX: 1.18, scaleY: 1.18, duration: 110, yoyo: true });
        DrawHelper.particulas(this, cx, cy, obj.color, 10);
        this._tocarObjeto(obj.id, item);
      });

      this._objGroup.push(ped, aura, g, lbl, hit);
    });
  }

  _tocarObjeto(objId, item) {
    const paso     = this._secuencia.length;
    const esperado = item.secuencia[paso];

    if (objId === esperado) {
      this._secuencia.push(objId);

      // Marcar indicador de paso
      const circleRef = this._pasoIndicadores[1 + paso * 2];   // offset por la línea si existe
      const numRef    = this._pasoIndicadores[2 + paso * 2];
      // Buscar por referencia directa
      const allCircles = this._pasoIndicadores.filter(p => p.type === 'Arc');
      const allNums    = this._pasoIndicadores.filter(p => p.type === 'Text');
      if (allCircles[paso]) { allCircles[paso].setFillStyle(PALETTE.sage); allCircles[paso].setStrokeStyle(1.5, PALETTE.sage, 0.8); }
      if (allNums[paso])    { allNums[paso].setStyle({ color: '#66ffaa' }); }

      if (this._secuencia.length === item.secuencia.length) {
        this._concluirItem(item, true);
      } else {
        const restante = item.secuencia.length - this._secuencia.length;
        this._pistaText.setText(`✓ Paso ${this._secuencia.length} correcto · faltan ${restante}`);
      }
    } else {
      this._erroresParciales++;
      this._feedbackText.setStyle(TEXT_STYLES.feedback_err).setText('✗ Orden incorrecto, intenta de nuevo');
      if (this._erroresParciales >= 2) {
        this.time.delayedCall(700, () => this._concluirItem(item, false));
      } else {
        this.time.delayedCall(500, () => {
          this._feedbackText.setText('');
          this._pistaText.setText('Reinicia la secuencia desde el principio');
          this._secuencia = [];
          // Resetear indicadores
          this._pasoIndicadores.filter(p => p.type === 'Arc').forEach(c => { c.setFillStyle(0x1a0a08); c.setStrokeStyle(1.5, PALETTE.ember, 0.35); });
          this._pasoIndicadores.filter(p => p.type === 'Text').forEach(t => t.setStyle({ color: '#3a1a0a' }));
        });
      }
    }
  }

  _concluirItem(item, correcto) {
    if (this._bloqueado) return;
    this._bloqueado = true;
    const tiempoMs = Date.now() - this._tiempoInicio;
    GameState.registrarOracion(item.id, item.instruccion, correcto, this._erroresParciales, tiempoMs);
    if (correcto) {
      this._feedbackText.setStyle(TEXT_STYLES.feedback_ok).setText('✦ ¡Instrucción completada!');
      DrawHelper.particulas(this, this.scale.width / 2, this.scale.height / 2 + 40, PALETTE.gold, 20);
    } else {
      this._feedbackText.setStyle(TEXT_STYLES.feedback_err).setText(`✗ Secuencia: ${item.secuencia.join(' → ')}`);
    }
    this.time.delayedCall(DATA.config.feedbackDuracion + 400, () => { this._idx++; this._mostrarItem(); });
  }

  _terminar() {
    GameState.completado.oraciones = true;
    this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }
}