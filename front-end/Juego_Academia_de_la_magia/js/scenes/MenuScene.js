class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width: W, height: H } = this.scale;

    DrawHelper.fondoArcano(this, PALETTE.ink);
    DrawHelper.bordeSala(this, PALETTE.goldDim, 0.7);
    this._dibujarTorre(110, H);
    this._dibujarTorre(W - 110, H, true);

    /* Título */
    const titleY = 200;
    this.add.text(W/2, titleY - 38, '· PROLEC-R · Evaluación de Procesos Lectores ·', {
      ...TEXT_STYLES.label, color: '#3a2a55', fontSize: '18px',
    }).setOrigin(0.5);

    const title = this.add.text(W/2, titleY + 24, 'La Academia de Magia', {
      ...TEXT_STYLES.title,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, y: titleY + 18, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this._separador(W/2, titleY + 72, 500);

    this.add.text(W/2, titleY + 116,
      'Eres un aprendiz de mago. Completa los tres desafíos para graduarte\ny dominar los procesos lectores de la Academia.',
      { ...TEXT_STYLES.body, align: 'center', color: '#7a6a99', fontSize: '22px' }
    ).setOrigin(0.5);

    /* Tarjetas */
    const misiones = [
      {
        key: 'letras', scene: 'LetrasScene', icon: '◈',
        titulo: 'Sala de los Espejos', sub: 'Identificación de Letras',
        items: '20 ítems · Igual / Diferente',
        colorH: '#7ec8e3', colorBg: 0x060d14, colorBrd: 0x2a6a88,
      },
      {
        key: 'palabras', scene: 'PalabrasScene', icon: '⚗',
        titulo: 'Clase de Pociones', sub: 'Palabras y Pseudopalabras',
        items: '40 ítems · Real / Mágico',
        colorH: '#88ffcc', colorBg: 0x060e08, colorBrd: 0x2a7755,
      },
      {
        key: 'oraciones', scene: 'OracionesScene', icon: '⚔',
        titulo: 'Sala de Entrenamiento', sub: 'Comprensión de Oraciones',
        items: '8 ítems · Seguir instrucciones',
        colorH: '#ffcc88', colorBg: 0x120a04, colorBrd: 0x885522,
      },
    ];

    const cardW = 360, cardH = 180, gap = 40;
    const totalW = misiones.length * cardW + (misiones.length - 1) * gap;
    const startX = W/2 - totalW/2 + cardW/2;
    const cardY = H/2 + 130;

    misiones.forEach((m, i) => {
      this._tarjetaMision(startX + i * (cardW + gap), cardY, cardW, cardH, m);
    });

    this._separador(W/2, cardY + cardH/2 + 36, 400);

    const resBtn = this.add.text(W/2, cardY + cardH/2 + 66, '[ Ver Métricas de la Sesión ]', {
      ...TEXT_STYLES.bodySmall, color: '#3a2a55',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resBtn.on('pointerover', () => resBtn.setStyle({ color: '#9977cc' }));
    resBtn.on('pointerout',  () => resBtn.setStyle({ color: '#3a2a55' }));
    resBtn.on('pointerdown', () => this._irA('ResultadosScene'));

    this.add.text(W - 36, H - 24, 'v2.0 · PROLEC-R', {
      ...TEXT_STYLES.bodySmall, color: '#1e1528', fontSize: '16px',
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(700, 0, 0, 0);
  }

  _tarjetaMision(cx, cy, w, h, m) {
    const completado = GameState.completado[m.key];
    const g = this.add.graphics();

    // Sombra
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(cx - w/2 + 6, cy - h/2 + 6, w, h, 12);
    // Fondo
    g.fillStyle(m.colorBg);
    g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    // Borde
    g.lineStyle(completado ? 2 : 1, m.colorBrd, completado ? 0.9 : 0.45);
    g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    // Borde interior sutil
    g.lineStyle(1, m.colorBrd, 0.12);
    g.strokeRoundedRect(cx - w/2 + 5, cy - h/2 + 5, w - 10, h - 10, 9);

    // Sello completado
    if (completado) {
      this.add.text(cx + w/2 - 18, cy - h/2 + 18, '✓', {
        fontFamily: FONTS.display, fontSize: '18px', color: m.colorH,
      }).setOrigin(0.5);
    }

    // Icono grande
    this.add.text(cx, cy - 46, m.icon, {
      fontFamily: FONTS.display, fontSize: '30px', color: m.colorH,
    }).setOrigin(0.5);

    // Título
    this.add.text(cx, cy - 12, m.titulo, {
      ...TEXT_STYLES.headerRoom, fontSize: '20px', color: m.colorH,
    }).setOrigin(0.5);

    // Sub
    this.add.text(cx, cy + 18, m.sub, {
      ...TEXT_STYLES.body, fontSize: '16px', color: '#7a6a99', fontStyle: 'italic',
    }).setOrigin(0.5);

    // Items
    this.add.text(cx, cy + 50, m.items, {
      ...TEXT_STYLES.bodySmall, color: '#2a1a44', fontSize: '16px',
    }).setOrigin(0.5);

    // Hit area
    const bg = this.add.rectangle(cx, cy, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      g.clear();
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(cx - w/2 + 6, cy - h/2 + 6, w, h, 12);
      g.fillStyle(m.colorBrd, 0.18);
      g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
      g.lineStyle(2, m.colorBrd, 1);
      g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 12);
    });
    bg.on('pointerout', () => {
      g.clear();
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(cx - w/2 + 6, cy - h/2 + 6, w, h, 12);
      g.fillStyle(m.colorBg);
      g.fillRoundedRect(cx - w/2, cy - h/2, w, h, 12);
      g.lineStyle(completado ? 2 : 1, m.colorBrd, completado ? 0.9 : 0.45);
      g.strokeRoundedRect(cx - w/2, cy - h/2, w, h, 12);
      g.lineStyle(1, m.colorBrd, 0.12);
      g.strokeRoundedRect(cx - w/2 + 5, cy - h/2 + 5, w - 10, h - 10, 9);
    });
    bg.on('pointerdown', () => this._irA(m.scene));
  }

  _dibujarTorre(x, groundY, flip = false) {
    const g = this.add.graphics().setAlpha(0.12);
    const sx = flip ? -1 : 1;
    g.fillStyle(0x3a2a5a);
    g.fillRect(x - 28, groundY - 200, 56, 200);
    for (let i = -1; i <= 1; i++) {
      g.fillRect(x + i * 20 * sx - 9, groundY - 218, 18, 28);
    }
    g.fillStyle(0x5533aa);
    g.fillTriangle(x - 34, groundY - 200, x + 34, groundY - 200, x, groundY - 300);
    g.fillStyle(0xffeeaa, 0.55);
    g.fillRect(x - 8, groundY - 165, 16, 22);
    g.fillRect(x - 8, groundY - 120, 16, 22);
    g.fillStyle(0xaa88ff, 0.15);
    g.fillCircle(x, groundY - 300, 40);
  }

  _separador(x, y, w) {
    const g = this.add.graphics();
    g.lineStyle(1, PALETTE.goldDim, 0.45);
    g.beginPath(); g.moveTo(x - w/2, y); g.lineTo(x + w/2, y); g.strokePath();
    g.fillStyle(PALETTE.gold, 0.45);
    g.fillCircle(x, y, 3.5);
    g.fillCircle(x - w/2 + 10, y, 2);
    g.fillCircle(x + w/2 - 10, y, 2);
  }

  _irA(scene) {
    this.cameras.main.fadeOut(DATA.config.transicionDuracion, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene));
  }
}