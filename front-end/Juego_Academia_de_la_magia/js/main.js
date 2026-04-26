/* ══════════════════════════════════════════════
   main.js · Inicialización de Phaser
   ══════════════════════════════════════════════ */

const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 900,
  parent: 'game-container',
  backgroundColor: '#08080f',
  scene: [
    BootScene,
    MenuScene,
    LetrasScene,
    PalabrasScene,
    OracionesScene,
    ResultadosScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 900,
  },
  render: {
    antialias:    true,
    antialiasGL:  true,
    pixelArt:     false,
    roundPixels:  false,
    resolution:   window.devicePixelRatio || 2,
  },
};

const game = new Phaser.Game(config);