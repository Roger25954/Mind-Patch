export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // 1. CARGA DESDE LA RAÍZ (Donde está el index.html)
        this.load.image('fondo_menu', 'menu.png');
        this.load.image('boton_inicio', 'boton.png'); //  botón kawaii

        // 2. CARGA DESDE ASSETS (Rutas organizadas)
        // Usamos la ruta simple sin espacios ni tildes
        const rutaImg = 'assets/imagenes/';

        this.load.image('fondo', rutaImg + 'fondo.png');
        this.load.image('dulce', rutaImg + 'dulce.png');
        this.load.image('galleta', rutaImg + 'galleta.png');
        this.load.image('mostrador', rutaImg + 'mostrador.png');
        this.load.image('mounstro_1', rutaImg + 'mounstro_1.png');
        this.load.image('mounstro_2', rutaImg + 'mounstro_2.png');
        this.load.image('mounstro_3', rutaImg + 'mounstro_3.png');
        this.load.image('mounstro_4', rutaImg + 'mounstro_4.png');
        this.load.image('paleta', rutaImg + 'paleta.png');
        this.load.image('listo', rutaImg + 'listo.png');
        this.load.image('siguiente', rutaImg + 'siguiente.png');
        this.load.image('moneda', rutaImg + 'moneda.png');
        this.load.image('cake', rutaImg + 'cake.png');

        // 3. CARGA DE DATOS
        this.load.json('levelData', 'assets/data/levels.json');
    }

    create() {
        this.scene.start('Menu');
    }
}