class PalabrasScene extends Phaser.Scene {
  constructor() { super({ key: 'PalabrasScene' }); }

  init() {
    this._items      = Phaser.Utils.Array.Shuffle([...DATA.palabras]);
    this._idx        = 0;
    this._bloqueado  = false;
    this._tiempoMs   = DATA.config.tiempoPalabra_ms;
    this._advertMs   = DATA.config.tiempoAdvertencia;
    this._timerTween = null;
  }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, 0x030e06);
    this._añadirBurbujas(W, H);
    DrawHelper.bordeSala(this, 0x2a6644, 0.6);
    const { progressText } = DrawHelper.headerSala(this, 'Clase de Pociones', '⚗', '#88ffcc');
    this._progressText = progressText;

    // Instrucción
    DrawHelper.panelPergamino(this, W/2, 140, W - 100, 60);
    this.add.text(W/2, 140,
      '¿El ingrediente es REAL (existe en la naturaleza) o es MÁGICO (inventado)?',
      { ...TEXT_STYLES.instruction, fontSize: '22px', color: '#aaddbb' }
    ).setOrigin(0.5);

    // Frasco grande en el centro
    const frascoY = H/2 - 40;
    this._grafFrasco = this.add.graphics();
    this._dibujarFrasco(W/2, frascoY);

    // Palabra sobre el frasco
    this._palabraText = this.add.text(W/2, frascoY + 10, '', {
      ...TEXT_STYLES.monoLarge,
      color: '#ccffdd',
      stroke: '#061208',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Barra de tiempo
    const barY = H/2 + 130;
    const barW = 500;
    DrawHelper.panelPergamino(this, W/2, barY, barW + 30, 36, 0.5);
    this.add.rectangle(W/2, barY, barW, 10, 0x081408);
    this._timerBar = this.add.rectangle(W/2 - barW/2, barY, barW, 10, PALETTE.sage).setOrigin(0, 0.5);
    this._timerLabel = this.add.text(W/2, barY + 22, '', {
      ...TEXT_STYLES.bodySmall, color: '#2a5533', fontSize: '16px',
    }).setOrigin(0.5);

    // Botones
    const btnY = H/2 + 206;
    DrawHelper.botonMagico(this, W/2 - 210, btnY, 320, 76, '🌿  REAL', 0x050e06, '#66ffaa', () => this._responder('real'));
    DrawHelper.botonMagico(this, W/2 + 210, btnY, 320, 76, '✨  MÁGICO', 0x0c0518, '#cc99ff', () => this._responder('pseudo'));

    // Atajos
    this.input.keyboard.on('keydown-A', () => this._responder('real'));
    this.input.keyboard.on('keydown-L', () => this._responder('pseudo'));
    this.add.text(W/2, btnY + 54, '[ A ] Real   ·   [ L ] Mágico', {
      ...TEXT_STYLES.bodySmall, color: '#1a2a1a', fontSize: '18px',
    }).setOrigin(0.5);

    this._feedbackText = this.add.text(W/2, btnY + 80, '', { ...TEXT_STYLES.feedback_ok }).setOrigin(0.5);

    this._crearBarraProgreso(W/2, H - 40, DATA.palabras.length);
    this._mostrarItem();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _añadirBurbujas(W, H) {
    for (let i = 0; i < 14; i++) {
      const bx = Phaser.Math.Between(50, W - 50);
      const by = Phaser.Math.Between(H * 0.6, H - 30);
      const br = Phaser.Math.Between(6, 22);
      const b  = this.add.circle(bx, by, br, 0x44ff99, 0.03 + Math.random() * 0.05);
      this.tweens.add({
        targets: b, y: by - Phaser.Math.Between(100, 220), alpha: 0,
        duration: Phaser.Math.Between(3000, 6000), repeat: -1,
        delay: Phaser.Math.Between(0, 4000), ease: 'Sine.easeIn',
        onRepeat: () => { b.y = by; b.setAlpha(0.03 + Math.random() * 0.05); },
      });
    }
  }

  _dibujarFrasco(x, y) {
    const g = this._grafFrasco;
    g.clear();
    // Sombra
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(x + 6, y + 110, 200, 28);
    // Cuerpo
    g.fillStyle(0x081a0a, 0.88);
    g.fillRoundedRect(x - 95, y - 88, 190, 190, { tl: 12, tr: 12, bl: 40, br: 40 });
    // Cuello
    g.fillStyle(0x0c2010, 0.92);
    g.fillRoundedRect(x - 34, y - 118, 68, 38, 8);
    // Corcho
    g.fillStyle(0x7a5230);
    g.fillRoundedRect(x - 26, y - 130, 52, 20, 5);
    // Líquido (capa brillante en la mitad inferior)
    g.fillStyle(0x22cc55, 0.12);
    g.fillRoundedRect(x - 88, y + 10, 176, 80, { bl: 38, br: 38 });
    // Brillo lateral
    g.fillStyle(0x88ffaa, 0.06);
    g.fillRoundedRect(x - 82, y - 80, 36, 130, 8);
    // Borde principal
    g.lineStyle(2, 0x3a9955, 0.55);
    g.strokeRoundedRect(x - 95, y - 88, 190, 190, { tl: 12, tr: 12, bl: 40, br: 40 });
    g.strokeRoundedRect(x - 34, y - 118, 68, 38, 8);
    // Etiqueta
    g.fillStyle(0x081408, 0.8);
    g.fillRoundedRect(x - 64, y - 22, 128, 66, 5);
    g.lineStyle(1, 0x2a5535, 0.5);
    g.strokeRoundedRect(x - 64, y - 22, 128, 66, 5);
  }

  _crearBarraProgreso(cx, cy, total) {
    this._marcadores = [];
    const maxW = 960;
    const sepX = Math.min(18, maxW / total);
    const startX = cx - (total - 1) * sepX / 2;
    for (let i = 0; i < total; i++) {
      const m = this.add.rectangle(startX + i * sepX, cy, 12, 5, 0x081408);
      m.setStrokeStyle(0.5, 0x2a5535, 0.4);
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
    this._bloqueado = false;
    this._dibujarFrasco(this.scale.width / 2, this.scale.height / 2 - 40);
    this._palabraText.setAlpha(0).setText(item.texto);
    this.tweens.add({ targets: this._palabraText, alpha: 1, duration: 240, ease: 'Sine.Out' });

    if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
    const barW = 500;
    this._timerBar.setFillStyle(PALETTE.sage).width = barW;
    this._timerLabel.setText('');
    const inicio = Date.now();

    this._timerTween = this.tweens.add({
      targets: this._timerBar, width: 0, duration: this._tiempoMs, ease: 'Linear',
      onUpdate: () => {
        const restante = Math.max(0, this._tiempoMs - (Date.now() - inicio));
        if (restante <= this._advertMs) this._timerBar.setFillStyle(PALETTE.ember);
        if (restante <= 600) this._timerLabel.setText('⏳ ¡Rápido!').setStyle({ ...TEXT_STYLES.bodySmall, color: '#cc5533', fontSize: '16px' });
      },
      onComplete: () => this._responder(null),
    });
  }

  _responder(tipo) {
    if (this._bloqueado) return;
    this._bloqueado = true;
    if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
    const item     = this._items[this._idx];
    const barW     = 500;
    const tiempoMs = this._tiempoMs - (this._timerBar.width / barW) * this._tiempoMs;
    const agotado  = tipo === null;
    const correcto = !agotado && tipo === item.tipo;
    GameState.registrarPalabra(item.texto, item.tipo, tipo, correcto, Math.round(tiempoMs), agotado);
    this._actualizarMarcador(this._idx, correcto);
    if (agotado) {
      this._feedbackText.setStyle(TEXT_STYLES.feedback_warn).setText('⏳ Tiempo agotado');
    } else if (correcto) {
      this._feedbackText.setStyle(TEXT_STYLES.feedback_ok).setText('✦ ¡Ingrediente correcto!');
      DrawHelper.particulas(this, this.scale.width / 2, this.scale.height / 2 - 30,
        tipo === 'real' ? PALETTE.sage : PALETTE.arcane, 14);
    } else {
      const era = item.tipo === 'real' ? 'REAL' : 'MÁGICO';
      this._feedbackText.setStyle(TEXT_STYLES.feedback_err).setText(`✗ Era un ingrediente ${era}`);
    }
    this._timerLabel.setText('');
    this.time.delayedCall(DATA.config.feedbackDuracion, () => { this._idx++; this._mostrarItem(); });
  }

  _terminar() {
    GameState.completado.palabras = true;
    this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }
}