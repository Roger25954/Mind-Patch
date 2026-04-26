class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(W/2, H/2, W, H, 0x000000);

    const runa = this.add.text(W/2, H/2 - 50, '✦', {
      fontFamily: FONTS.display, fontSize: '80px', color: '#c9a84c',
    }).setOrigin(0.5);
    this.tweens.add({ targets: runa, angle: 360, duration: 2200, repeat: -1 });

    this.add.text(W/2, H/2 + 60, 'Invocando la Academia de Magia...', {
      ...TEXT_STYLES.bodySmall, color: '#3a2a55', letterSpacing: 4,
    }).setOrigin(0.5);

    const barW = 340;
    this.add.rectangle(W/2, H/2 + 110, barW, 5, 0x12101a);
    const bar = this.add.rectangle(W/2 - barW/2, H/2 + 110, 0, 5, PALETTE.gold).setOrigin(0, 0.5);

    this.tweens.add({
      targets: bar, width: barW, duration: 1400, ease: 'Sine.easeInOut',
      onComplete: () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
      },
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}