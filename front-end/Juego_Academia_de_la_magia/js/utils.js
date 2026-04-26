/* ══════════════════════════════════════════════
   utils.js · Utilidades compartidas HD 1600×900
   ══════════════════════════════════════════════ */

const PALETTE = {
  ink:        0x06060e,
  inkMid:     0x0e0e1c,
  inkSoft:    0x18182c,
  gold:       0xc9a84c,
  goldLight:  0xf0d87a,
  goldDim:    0x4a3a18,
  goldGlow:   0xffe08a,
  arcane:     0x7755bb,
  arcaneDim:  0x2a1a44,
  arcaneGlow: 0xaa88ff,
  mist:       0x4a7aaa,
  ember:      0xcc5533,
  sage:       0x4a9966,
  crimson:    0xaa2233,
  frost:      0x7ec8e3,
  parchment:  0xf0e6c8,
  white:      0xffffff,
  black:      0x000000,
};

const FONTS = {
  display: 'Cinzel, Georgia, serif',
  body:    '"Crimson Pro", Georgia, serif',
  mono:    '"JetBrains Mono", monospace',
};

const TEXT_STYLES = {
  title: {
    fontFamily: FONTS.display,
    fontSize:   '52px',
    color:      '#c9a84c',
    stroke:     '#06060e',
    strokeThickness: 5,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize:   '24px',
    color:      '#9988bb',
    fontStyle:  'italic',
  },
  body: {
    fontFamily: FONTS.body,
    fontSize:   '26px',
    color:      '#c8bde0',
    lineSpacing: 8,
  },
  bodySmall: {
    fontFamily: FONTS.body,
    fontSize:   '20px',
    color:      '#7a6a99',
  },
  instruction: {
    fontFamily: FONTS.body,
    fontSize:   '28px',
    color:      '#e8dfc8',
    fontStyle:  'italic',
    lineSpacing: 8,
    align:      'center',
  },
  mono: {
    fontFamily: FONTS.mono,
    fontSize:   '42px',
    color:      '#e8dfc8',
    letterSpacing: 10,
  },
  monoLarge: {
    fontFamily: FONTS.mono,
    fontSize:   '56px',
    color:      '#f0e6c8',
    letterSpacing: 12,
  },
  label: {
    fontFamily: FONTS.display,
    fontSize:   '16px',
    color:      '#7755bb',
    letterSpacing: 4,
  },
  feedback_ok: {
    fontFamily: FONTS.body,
    fontSize:   '32px',
    color:      '#66ffaa',
    stroke:     '#06060e',
    strokeThickness: 3,
  },
  feedback_err: {
    fontFamily: FONTS.body,
    fontSize:   '32px',
    color:      '#ff6655',
    stroke:     '#06060e',
    strokeThickness: 3,
  },
  feedback_warn: {
    fontFamily: FONTS.body,
    fontSize:   '32px',
    color:      '#ffbb44',
    stroke:     '#06060e',
    strokeThickness: 3,
  },
  headerRoom: {
    fontFamily: FONTS.display,
    fontSize:   '26px',
    color:      '#c9a84c',
    letterSpacing: 3,
  },
  counterText: {
    fontFamily: FONTS.mono,
    fontSize:   '20px',
    color:      '#5a4a7a',
  },
};

/* ══════════════════════════════════════════════
   DrawHelper
   ══════════════════════════════════════════════ */
class DrawHelper {

  static fondoArcano(scene, tint = PALETTE.ink) {
    const { width: W, height: H } = scene.scale;
    scene.add.rectangle(W/2, H/2, W, H, tint);

    const g = scene.add.graphics();
    // Nebulosas de fondo
    [
      { cx: W * 0.18, cy: H * 0.25, r: 500, color: 0x221133, a: 0.18 },
      { cx: W * 0.82, cy: H * 0.75, r: 460, color: 0x112233, a: 0.15 },
      { cx: W * 0.55, cy: H * 0.42, r: 340, color: 0x1a1028, a: 0.10 },
    ].forEach(n => {
      g.fillStyle(n.color, n.a);
      g.fillCircle(n.cx, n.cy, n.r);
    });

    // Estrellas
    for (let i = 0; i < 220; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const r = Math.random() < 0.12 ? Math.random() * 2.2 + 1.0
              : Math.random() < 0.45 ? Math.random() * 1.2 + 0.4
              :                         0.3;
      const a = Math.random() * 0.7 + 0.15;
      const star = scene.add.circle(x, y, r, 0xffffff, a);
      if (r > 1.2) {
        scene.tweens.add({
          targets: star, alpha: { from: a, to: a * 0.1 },
          duration: Phaser.Math.Between(1400, 4500),
          yoyo: true, repeat: -1,
          delay: Phaser.Math.Between(0, 3500),
        });
      }
    }

    // Líneas de constelación
    g.lineStyle(1, 0xffffff, 0.025);
    for (let i = 0; i < 10; i++) {
      g.beginPath();
      g.moveTo(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H));
      g.lineTo(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H));
      g.strokePath();
    }
  }

  static bordeSala(scene, color = PALETTE.goldDim, alpha = 0.6) {
    const { width: W, height: H } = scene.scale;
    const g = scene.add.graphics();

    g.lineStyle(1.5, color, alpha);
    g.strokeRect(20, 20, W - 40, H - 40);
    g.lineStyle(1, color, alpha * 0.35);
    g.strokeRect(30, 30, W - 60, H - 60);

    const corners = [[30,30],[W-30,30],[30,H-30],[W-30,H-30]];
    const signs   = [[1,1],[-1,1],[1,-1],[-1,-1]];
    signs.forEach(([sx, sy], i) => {
      const [cx, cy] = corners[i];
      g.lineStyle(2, color, alpha);
      g.beginPath();
      g.moveTo(cx, cy + sy * 30);
      g.lineTo(cx, cy);
      g.lineTo(cx + sx * 30, cy);
      g.strokePath();
      g.fillStyle(color, alpha * 0.8);
      g.fillCircle(cx, cy, 3);
    });

    [[W/2,20],[W/2,H-20],[20,H/2],[W-20,H/2]].forEach(([mx, my]) => {
      g.fillStyle(color, alpha * 0.5);
      g.fillCircle(mx, my, 4);
      g.fillCircle(mx, my, 2);
    });
  }

  static headerSala(scene, nombre, icono = '✦', color = '#c9a84c') {
    const { width: W } = scene.scale;
    scene.add.rectangle(W/2, 50, W, 84, 0x09091a);
    scene.add.graphics()
      .lineStyle(1, PALETTE.goldDim, 0.4)
      .strokeRect(0, 90, W, 1);

    scene.add.text(100, 50, icono, {
      fontFamily: FONTS.display, fontSize: '28px', color,
    }).setOrigin(0.5).setAlpha(0.35);
    scene.add.text(W - 100, 50, icono, {
      fontFamily: FONTS.display, fontSize: '28px', color,
    }).setOrigin(0.5).setAlpha(0.35);

    const roomText = scene.add.text(W/2, 50, nombre, {
      ...TEXT_STYLES.headerRoom, color,
    }).setOrigin(0.5);

    const progressText = scene.add.text(W - 44, 32, '', {
      ...TEXT_STYLES.counterText,
    }).setOrigin(1, 0);

    return { roomText, progressText };
  }

  static panelPergamino(scene, x, y, w, h, alpha = 1) {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.4 * alpha);
    g.fillRoundedRect(x - w/2 + 7, y - h/2 + 7, w, h, 10);
    g.fillStyle(0x14100a, alpha * 0.94);
    g.fillRoundedRect(x - w/2, y - h/2, w, h, 10);
    g.lineStyle(1.5, PALETTE.gold, 0.3 * alpha);
    g.strokeRoundedRect(x - w/2, y - h/2, w, h, 10);
    g.lineStyle(1, PALETTE.goldDim, 0.14 * alpha);
    g.strokeRoundedRect(x - w/2 + 6, y - h/2 + 6, w - 12, h - 12, 7);
    return g;
  }

  static botonMagico(scene, x, y, w = 280, h = 70, texto,
                     colorFondo = PALETTE.arcaneDim, colorTexto = '#b399ee', callback) {
    const drawBg = (hover) => {
      g.clear();
      g.fillStyle(0x000000, 0.45);
      g.fillRoundedRect(x - w/2 + 5, y - h/2 + 5, w, h, 10);
      g.fillStyle(hover ? PALETTE.arcane : colorFondo);
      g.fillRoundedRect(x - w/2, y - h/2, w, h, 10);
      g.lineStyle(hover ? 2 : 1.5, hover ? PALETTE.arcaneGlow : PALETTE.arcane, hover ? 1 : 0.7);
      g.strokeRoundedRect(x - w/2, y - h/2, w, h, 10);
    };

    const g = scene.add.graphics();
    drawBg(false);

    const bg = scene.add.rectangle(x, y, w, h, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    const label = scene.add.text(x, y, texto, {
      ...TEXT_STYLES.body, color: colorTexto, fontSize: '22px',
    }).setOrigin(0.5);

    bg.on('pointerover',  () => { drawBg(true);  label.setColor('#ffffff'); });
    bg.on('pointerout',   () => { drawBg(false); label.setColor(colorTexto); });
    bg.on('pointerdown',  () => {
      scene.tweens.add({ targets: [g, label], scaleX: 0.96, scaleY: 0.96, duration: 80, yoyo: true });
      if (callback) callback();
    });

    return { bg, label, g };
  }

  static particulas(scene, x, y, color = 0xc9a84c, cantidad = 18) {
    for (let i = 0; i < cantidad; i++) {
      const angle = (i / cantidad) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = Phaser.Math.Between(32, 110);
      const px    = x + Math.cos(angle) * dist;
      const py    = y + Math.sin(angle) * dist;
      const size  = Phaser.Math.Between(3, 8);
      const p     = scene.add.circle(x, y, size, color, 0.95);
      scene.tweens.add({
        targets: p, x: px, y: py, alpha: 0, scale: 0.1,
        duration: Phaser.Math.Between(450, 800),
        ease: 'Quad.Out',
        onComplete: () => p.destroy(),
      });
    }
    const flash = scene.add.circle(x, y, 22, color, 0.5);
    scene.tweens.add({
      targets: flash, scale: 3, alpha: 0,
      duration: 320, ease: 'Sine.Out',
      onComplete: () => flash.destroy(),
    });
  }

  static pergaminoEspejos(scene, x, y, w = 260, h = 180) {
    const g = scene.add.graphics();
    // Sombra
    g.fillStyle(0x000000, 0.55);
    g.fillRoundedRect(x - w/2 + 6, y - h/2 + 6, w, h, 10);
    // Cuerpo
    g.fillStyle(0x1a1206);
    g.fillRoundedRect(x - w/2, y - h/2, w, h, 10);
    // Rollos
    g.fillStyle(0x261a08);
    g.fillEllipse(x, y - h/2, w, 32);
    g.fillEllipse(x, y + h/2, w, 32);
    g.lineStyle(1, PALETTE.goldDim, 0.5);
    g.strokeEllipse(x, y - h/2, w, 32);
    g.strokeEllipse(x, y + h/2, w, 32);
    // Líneas decorativas
    g.fillStyle(PALETTE.gold, 0.055);
    for (let i = 0; i < 6; i++) {
      g.fillRect(x - w/2 + 22, y - h/2 + 38 + i * 20, w - 44, 2.5);
    }
    // Borde
    g.lineStyle(1.5, PALETTE.gold, 0.4);
    g.strokeRoundedRect(x - w/2, y - h/2, w, h, 10);
    // Manchas decorativas
    g.fillStyle(PALETTE.goldDim, 0.1);
    g.fillCircle(x - w/2 + 26, y - h/2 + 26, 7);
    g.fillCircle(x + w/2 - 26, y + h/2 - 26, 7);
    return g;
  }

  static dibujarGlyph(g, glyph, x, y, color, scale = 1) {
    const s = scale;

    // Helper color oscurecido sin Phaser.Display
    const darken = (hex, amt) => {
      const r = Math.max(0, ((hex >> 16) & 0xff) - amt);
      const gv = Math.max(0, ((hex >> 8)  & 0xff) - amt);
      const b = Math.max(0, ( hex        & 0xff) - amt);
      return (r << 16) | (gv << 8) | b;
    };
    const lighten = (hex, amt) => {
      const r = Math.min(255, ((hex >> 16) & 0xff) + amt);
      const gv = Math.min(255, ((hex >> 8)  & 0xff) + amt);
      const b = Math.min(255, ( hex        & 0xff) + amt);
      return (r << 16) | (gv << 8) | b;
    };

    switch (glyph) {

      case 'hat':
        g.fillStyle(color);
        g.fillEllipse(x, y + 36 * s, 150 * s, 32 * s);
        g.lineStyle(1.5, 0xffffff, 0.18);
        g.strokeEllipse(x, y + 36 * s, 150 * s, 32 * s);
        g.fillStyle(color);
        g.fillRoundedRect(x - 42 * s, y - 60 * s, 84 * s, 100 * s, { tl: 20, tr: 20, bl: 4, br: 4 });
        g.lineStyle(1.5, 0xffffff, 0.18);
        g.strokeRoundedRect(x - 42 * s, y - 60 * s, 84 * s, 100 * s, { tl: 20, tr: 20, bl: 4, br: 4 });
        g.fillStyle(PALETTE.gold, 0.75);
        g.fillRect(x - 42 * s, y + 26 * s, 84 * s, 12 * s);
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(x - 30 * s, y - 58 * s, 18 * s, 60 * s, 4);
        break;

      case 'wand':
        g.fillStyle(color);
        g.fillRoundedRect(x - 8 * s, y - 64 * s, 16 * s, 110 * s, 5);
        g.lineStyle(1.5, 0xffffff, 0.18);
        g.strokeRoundedRect(x - 8 * s, y - 64 * s, 16 * s, 110 * s, 5);
        g.lineStyle(1, 0x000000, 0.18);
        for (let i = 0; i < 5; i++) {
          g.beginPath(); g.moveTo(x - 6 * s, y - 56 * s + i * 20 * s);
          g.lineTo(x + 6 * s, y - 50 * s + i * 20 * s); g.strokePath();
        }
        g.fillStyle(PALETTE.goldLight, 0.95);
        const wpts = [];
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
          const r = i % 2 === 0 ? 16 * s : 7 * s;
          wpts.push({ x: x + Math.cos(a) * r, y: (y - 68 * s) + Math.sin(a) * r });
        }
        g.fillPoints(wpts, true);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(x - 3 * s, y - 72 * s, 4 * s);
        break;

      case 'star': {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
          const r = i % 2 === 0 ? 58 * s : 24 * s;
          pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
        }
        g.fillStyle(color);
        g.fillPoints(pts, true);
        g.lineStyle(1.5, 0xffffff, 0.25);
        g.strokePoints(pts, true);
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(x, y, 12 * s);
        g.fillStyle(PALETTE.goldLight, 0.6);
        g.fillCircle(x - 14 * s, y - 14 * s, 6 * s);
        break;
      }

      case 'moon':
        g.fillStyle(color);
        g.fillCircle(x, y, 58 * s);
        g.fillStyle(0x0e0e1c);
        g.fillCircle(x + 25 * s, y - 12 * s, 42 * s);
        g.lineStyle(1.5, 0xffffff, 0.12);
        g.strokeCircle(x, y, 58 * s);
        g.fillStyle(0x000000, 0.1);
        g.fillCircle(x - 20 * s, y + 18 * s, 9 * s);
        g.fillCircle(x - 6 * s,  y + 32 * s, 6 * s);
        g.fillCircle(x - 32 * s, y,           7 * s);
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(x - 22 * s, y - 24 * s, 11 * s);
        break;

      case 'book':
        g.fillStyle(darken(color, 30));
        g.fillRoundedRect(x - 44 * s + 5, y - 62 * s + 5, 88 * s, 124 * s, 6);
        g.fillStyle(color);
        g.fillRoundedRect(x - 44 * s, y - 62 * s, 88 * s, 124 * s, 6);
        g.fillStyle(0x000000, 0.28);
        g.fillRect(x - 44 * s, y - 62 * s, 12 * s, 124 * s);
        g.lineStyle(1.5, 0xffffff, 0.18);
        g.strokeRoundedRect(x - 44 * s, y - 62 * s, 88 * s, 124 * s, 6);
        g.fillStyle(0xffffff, 0.06);
        for (let l = 0; l < 7; l++) {
          g.fillRect(x - 26 * s, y - 46 * s + l * 16 * s, 58 * s, 3 * s);
        }
        g.fillStyle(PALETTE.gold, 0.85);
        g.fillRect(x + 24 * s, y - 62 * s, 7 * s, 42 * s);
        g.fillStyle(0xffffff, 0.12);
        g.fillRoundedRect(x - 36 * s, y - 60 * s, 16 * s, 80 * s, 3);
        break;

      case 'gem': {
        const gw = 70 * s, gh = 80 * s;
        g.fillStyle(0x000000, 0.28);
        g.fillTriangle(x + 5, y - gh/2 + 5, x - gw/2 + 5, y + 5, x + gw/2 + 5, y + 5);
        g.fillTriangle(x - gw/2 + 5, y + 5, x + gw/2 + 5, y + 5, x + 5, y + gh * 0.65 + 5);
        g.fillStyle(color, 0.92);
        g.fillTriangle(x, y - gh/2, x - gw/2, y, x + gw/2, y);
        g.fillStyle(darken(color, 22), 0.92);
        g.fillTriangle(x - gw/2, y, x + gw/2, y, x, y + gh * 0.65);
        g.fillStyle(0x000000, 0.18);
        g.fillTriangle(x, y - gh/2, x - gw/2, y, x, y);
        g.fillStyle(0xffffff, 0.2);
        g.fillTriangle(x, y - gh/2, x - 18 * s, y, x + 18 * s, y);
        g.lineStyle(1.5, 0xffffff, 0.28);
        g.strokeTriangle(x, y - gh/2, x - gw/2, y, x + gw/2, y);
        g.strokeTriangle(x - gw/2, y, x + gw/2, y, x, y + gh * 0.65);
        g.lineStyle(1, 0xffffff, 0.12);
        g.beginPath(); g.moveTo(x, y - gh/2); g.lineTo(x, y + gh * 0.65); g.strokePath();
        g.fillStyle(0xffffff, 0.65);
        g.fillCircle(x - 9 * s, y - gh/2 + 14 * s, 5 * s);
        break;
      }

      case 'scroll':
        g.fillStyle(color);
        g.fillRoundedRect(x - 40 * s, y - 66 * s, 80 * s, 132 * s, 8);
        g.fillStyle(darken(color, 18));
        g.fillEllipse(x, y - 66 * s, 80 * s, 26 * s);
        g.fillEllipse(x, y + 66 * s, 80 * s, 26 * s);
        g.fillStyle(0x000000, 0.16);
        for (let l = 0; l < 6; l++) {
          g.fillRect(x - 28 * s, y - 44 * s + l * 16 * s, 56 * s, 3 * s);
        }
        g.fillStyle(PALETTE.crimson, 0.85);
        g.fillCircle(x, y, 12 * s);
        g.fillStyle(PALETTE.gold, 0.9);
        g.fillCircle(x, y, 6 * s);
        g.lineStyle(1.5, 0xffffff, 0.18);
        g.strokeRoundedRect(x - 40 * s, y - 66 * s, 80 * s, 132 * s, 8);
        g.strokeEllipse(x, y - 66 * s, 80 * s, 26 * s);
        g.strokeEllipse(x, y + 66 * s, 80 * s, 26 * s);
        break;

      case 'potion':
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(x + 5, y + 50 * s, 86 * s, 22 * s);
        g.fillStyle(color, 0.88);
        g.fillEllipse(x, y + 22 * s, 86 * s, 82 * s);
        g.fillStyle(color, 0.88);
        g.fillRoundedRect(x - 18 * s, y - 42 * s, 36 * s, 66 * s, 5);
        g.fillStyle(0x8B6340);
        g.fillRoundedRect(x - 15 * s, y - 56 * s, 30 * s, 18 * s, 4);
        g.fillStyle(lighten(color, 22), 0.5);
        g.fillEllipse(x, y + 34 * s, 68 * s, 50 * s);
        g.fillStyle(0xffffff, 0.22);
        g.fillCircle(x - 16 * s, y + 12 * s, 12 * s);
        g.fillStyle(0xffffff, 0.14);
        g.fillCircle(x + 10 * s, y + 28 * s, 7 * s);
        g.fillStyle(0xffffff, 0.24);
        g.fillEllipse(x - 18 * s, y + 16 * s, 20 * s, 32 * s);
        g.lineStyle(1.5, 0xffffff, 0.22);
        g.strokeEllipse(x, y + 22 * s, 86 * s, 82 * s);
        g.strokeRoundedRect(x - 18 * s, y - 42 * s, 36 * s, 66 * s, 5);
        break;
    }
  }
}