class LetrasScene extends Phaser.Scene {
  constructor() { super({ key: 'LetrasScene' }); }

  init() {
    this._items        = Phaser.Utils.Array.Shuffle([...DATA.letras]);
    this._idx          = 0;
    this._bloqueado    = false;
    this._swipeStart   = null;
    this._tiempoInicio = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, 0x05070e);

    // Efecto espejo central
    const mg = this.add.graphics();
    mg.fillStyle(0x7ec8e3, 0.04);
    mg.fillRect(W/2 - 80, 90, 160, H - 140);
    mg.lineStyle(1, 0x7ec8e3, 0.12);
    mg.beginPath(); mg.moveTo(W/2, 90); mg.lineTo(W/2, H - 50); mg.strokePath();
    // Reflejos del espejo
    for (let i = 0; i < 4; i++) {
      const ry = 120 + i * 160;
      mg.lineStyle(1, 0x7ec8e3, 0.06);
      mg.beginPath(); mg.moveTo(W/2 - 60, ry); mg.lineTo(W/2 + 60, ry + 20); mg.strokePath();
    }

    DrawHelper.bordeSala(this, 0x2a5a6a, 0.65);
    const { progressText } = DrawHelper.headerSala(this, 'Sala de los Espejos', '◈', '#7ec8e3');
    this._progressText = progressText;

    // Instrucción
    DrawHelper.panelPergamino(this, W/2, 140, W - 100, 60);
    this.add.text(W/2, 140,
      '¿Los dos pergaminos son exactamente IGUALES o DIFERENTES?',
      { ...TEXT_STYLES.instruction, fontSize: '22px', color: '#aed8e6' }
    ).setOrigin(0.5);

    // Etiquetas
    this.add.text(W/2 - 280, 214, 'PERGAMINO  A', { ...TEXT_STYLES.label, color: '#2a5a6a' }).setOrigin(0.5);
    this.add.text(W/2 + 280, 214, 'PERGAMINO  B', { ...TEXT_STYLES.label, color: '#2a5a6a' }).setOrigin(0.5);

    // Pergaminos
    const pergY = H/2 - 20;
    DrawHelper.pergaminoEspejos(this, W/2 - 280, pergY);
    DrawHelper.pergaminoEspejos(this, W/2 + 280, pergY);

    this._textoA = this.add.text(W/2 - 280, pergY, '', {
      ...TEXT_STYLES.mono, color: '#c8aa70', letterSpacing: 8,
    }).setOrigin(0.5);
    this._textoB = this.add.text(W/2 + 280, pergY, '', {
      ...TEXT_STYLES.mono, color: '#c8aa70', letterSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(W/2, pergY + 110, '— espejo mágico —', {
      ...TEXT_STYLES.bodySmall, color: '#1e4050', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Botones
    const btnY = H/2 + 190;
    DrawHelper.botonMagico(this, W/2 - 200, btnY, 300, 72, '← IGUALES', 0x060e14, '#7ec8e3', () => this._responder(true));
    DrawHelper.botonMagico(this, W/2 + 200, btnY, 300, 72, 'DIFERENTES →', 0x140606, '#ff9988', () => this._responder(false));

    this.add.text(W/2, H - 36,
      'Swipe ← para Iguales   ·   Swipe → para Diferentes',
      { ...TEXT_STYLES.bodySmall, color: '#1e1528', fontSize: '18px' }
    ).setOrigin(0.5);

    this._feedbackText = this.add.text(W/2, btnY + 60, '', { ...TEXT_STYLES.feedback_ok }).setOrigin(0.5);

    this._crearBarraProgreso(W/2, H - 60, DATA.letras.length);

    this.input.on('pointerdown', p => { this._swipeStart = p.x; });
    this.input.on('pointerup',   p => {
      if (this._bloqueado || this._swipeStart === null) return;
      const dx = p.x - this._swipeStart;
      if (Math.abs(dx) > 70) this._responder(dx < 0);
      this._swipeStart = null;
    });

    this._mostrarItem();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _crearBarraProgreso(cx, cy, total) {
    this._marcadores = [];
    const maxW = 900;
    const sepX = Math.min(22, maxW / total);
    const startX = cx - (total - 1) * sepX / 2;
    for (let i = 0; i < total; i++) {
      const m = this.add.rectangle(startX + i * sepX, cy, 14, 5, 0x12101a);
      m.setStrokeStyle(0.5, PALETTE.goldDim, 0.4);
      this._marcadores.push(m);
    }
  }

  _actualizarMarcador(idx, correcto) {
    if (this._marcadores[idx]) this._marcadores[idx].setFillStyle(correcto ? 0x4a9966 : 0xaa2233);
  }

  _mostrarItem() {
    if (this._idx >= this._items.length) { this._terminar(); return; }
    const item = this._items[this._idx];
    this._progressText.setText(`${this._idx + 1} / ${this._items.length}`);
    this._feedbackText.setText('');
    this._bloqueado    = false;
    this._tiempoInicio = Date.now();
    this._textoA.setAlpha(0).setText(item.a);
    this._textoB.setAlpha(0).setText(item.b);
    this.tweens.add({ targets: [this._textoA, this._textoB], alpha: 1, duration: 280, ease: 'Sine.Out' });
  }

  _responder(esIgual) {
    if (this._bloqueado) return;
    this._bloqueado = true;
    const item     = this._items[this._idx];
    const tiempoMs = Date.now() - this._tiempoInicio;
    const correcto = esIgual === item.igual;
    GameState.registrarLetra(`${item.a}/${item.b}`, esIgual, correcto, tiempoMs);
    this._actualizarMarcador(this._idx, correcto);
    if (correcto) {
      this._feedbackText.setStyle(TEXT_STYLES.feedback_ok).setText('✦ ¡Correcto!');
      DrawHelper.particulas(this, this.scale.width / 2, this.scale.height / 2 + 80, PALETTE.gold, 12);
    } else {
      const corrStr = item.igual ? 'Son IGUALES' : 'Son DIFERENTES';
      this._feedbackText.setStyle(TEXT_STYLES.feedback_err).setText(`✗ Incorrecto · ${corrStr}`);
    }
    this.time.delayedCall(DATA.config.feedbackDuracion, () => { this._idx++; this._mostrarItem(); });
  }

  _terminar() {
    GameState.completado.letras = true;
    this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }
}