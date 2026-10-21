import { Boot } from './src_scenes/Boot.js';
import { Menu } from './src_scenes/Menu.js';
import { GameScene } from './src_scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,  // Tu ancho base
    height: 600, // Tu alto base
    backgroundColor: '#000000',
    scale: {
        // FIT hace que el juego crezca hasta llenar la pantalla sin deformarse
        mode: Phaser.Scale.FIT,
        // Centra el lienzo tanto horizontal como verticalmente
        autoCenter: Phaser.Scale.CENTER_BOTH 
    },
    scene: [Boot, Menu, GameScene], // Asegúrate de tener tus escenas aquí
    // ... resto de tu configuración
};

const game = new Phaser.Game(config);