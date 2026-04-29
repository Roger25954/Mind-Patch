export class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        // 1. FONDO DEL MENÚ
        // Asegúrate de que 'fondo_menu' esté cargado en Boot.js
        const bg = this.add.image(400, 300, 'fondo_menu');
        bg.setDisplaySize(800, 600);

        // 2. TU NUEVO BOTÓN (Cargado como 'boton_inicio' en Boot.js)
        const botonIniciar = this.add.image(400, 520, 'boton_inicio').setInteractive();

        // Ajustamos el tamaño (puedes cambiar 0.6 si lo quieres más grande o chico)
        botonIniciar.setScale(0.6);

        // 3. EFECTO DE LATIDO (Tween)
        this.tweens.add({
            targets: botonIniciar,
            scale: 0.65,      // Crece un poquito
            duration: 800,    // Velocidad del latido
            yoyo: true,       // Regresa a su tamaño original
            repeat: -1        // Se repite para siempre
        });

        // 4. ACCIÓN AL HACER CLIC
        botonIniciar.on('pointerdown', () => {
            // Esto inicia la escena principal del juego
            this.scene.start('GameScene');
        });

        // OPCIONAL: Cambiar el cursor al pasar sobre el botón
        botonIniciar.on('pointerover', () => {
            this.game.canvas.style.cursor = 'pointer';
        });
        botonIniciar.on('pointerout', () => {
            this.game.canvas.style.cursor = 'default';
        });
    }
}