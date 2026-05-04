export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

  create(data) {
    // 1. GESTIÓN DE DATOS DEL NIVEL (JSON)
    const indexActual = data.levelIndex || 0;
    const allData = this.cache.json.get('levelData');
    const itemActual = allData.items[indexActual];

    // 2. EL FONDO (Ajustado a 800x600)
    const imagenFondo = this.add.image(400, 300, 'fondo');
    imagenFondo.setDisplaySize(800, 600); 

    // 3. EL MONSTRUO Y EL MOSTRADOR (Orden de capas)
    const keysMonstruos = ['mounstro_1', 'mounstro_2', 'mounstro_3'];
    const monstruoActual = keysMonstruos[indexActual % 3];
    
    const cliente = this.add.image(400, 380, monstruoActual);
    cliente.setDisplaySize(280, 280); 

    const mesa = this.add.image(400, 530, 'mostrador');
    mesa.setDisplaySize(600, 220); 

 // 4. TEXTO DE INSTRUCCIÓN (Con su fondo blanco como lo tenías)
// Usamos una validación para borrar el texto si ya existía y que no se encime
if (this.instruccionText) this.instruccionText.destroy();

this.instruccionText = this.add.text(400, 85, itemActual.mensaje, { 
    fontSize: '28px', 
    fill: '#2c3e50', 
    fontStyle: 'bold', 
    backgroundColor: '#ffffffcc', // El fondo blanco que pediste
    padding: {x: 20, y: 10},
    wordWrap: { width: 700 },
    align: 'center'
}).setOrigin(0.5);

// 4.1 TEXTO DE FEEDBACK (Donde sale el Excelente/Error)
// Lo ponemos un poco más abajo para que NO toque el cuadro blanco de la instrucción
if (this.feedbackText) this.feedbackText.destroy();

this.feedbackText = this.add.text(400, 220, '', {
    fontSize: '34px',
    fill: '#e74c3c',
    fontStyle: 'bold',
    stroke: '#ffffff',
    strokeThickness: 6,
    align: 'center'
}).setOrigin(0.5);

// 4.2 CONTADOR DE NIVEL (Esquina superior derecha)
    this.add.text(780, 20, `Nivel: ${indexActual + 1}`, {
        fontSize: '22px',
        fill: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 5 }
    }).setOrigin(1, 0); // Lo anclamos a la derecha

    // 5. MECÁNICA DE NIVEL
    if (itemActual.tipo === "Conteo") {
        this.prepararEscenaConteo(itemActual, indexActual);
    } else {
        this.prepararEscenaMagnitud(itemActual, indexActual);
    }
}
create(data) {
    // 1. GESTIÓN DE DATOS DEL NIVEL (JSON)
    const indexActual = data.levelIndex || 0;
    const allData = this.cache.json.get('levelData');
    const itemActual = allData.items[indexActual];

    // 2. EL FONDO (Ajustado a 800x600)
    const imagenFondo = this.add.image(400, 300, 'fondo');
    imagenFondo.setDisplaySize(800, 600); 

    // 3. EL MONSTRUO Y EL MOSTRADOR (Orden de capas)
    const keysMonstruos = ['mounstro_1', 'mounstro_2', 'mounstro_3'];
    const monstruoActual = keysMonstruos[indexActual % 3];
    
    const cliente = this.add.image(400, 380, monstruoActual);
    cliente.setDisplaySize(280, 280); 

    const mesa = this.add.image(400, 530, 'mostrador');
    mesa.setDisplaySize(600, 220); 

 // 4. TEXTO DE INSTRUCCIÓN (Con su fondo blanco como lo tenías)
// Usamos una validación para borrar el texto si ya existía y que no se encime
if (this.instruccionText) this.instruccionText.destroy();

this.instruccionText = this.add.text(400, 85, itemActual.mensaje, { 
    fontSize: '28px', 
    fill: '#2c3e50', 
    fontStyle: 'bold', 
    backgroundColor: '#ffffffcc', // El fondo blanco que pediste
    padding: {x: 20, y: 10},
    wordWrap: { width: 700 },
    align: 'center'
}).setOrigin(0.5);

// 4.1 TEXTO DE FEEDBACK (Donde sale el Excelente/Error)
// Lo ponemos un poco más abajo para que NO toque el cuadro blanco de la instrucción
if (this.feedbackText) this.feedbackText.destroy();

this.feedbackText = this.add.text(400, 220, '', {
    fontSize: '34px',
    fill: '#e74c3c',
    fontStyle: 'bold',
    stroke: '#ffffff',
    strokeThickness: 6,
    align: 'center'
}).setOrigin(0.5);

// 4.2 CONTADOR DE NIVEL (Esquina superior derecha)
    this.add.text(780, 20, `Nivel: ${indexActual + 1}`, {
        fontSize: '22px',
        fill: '#ffffff',
        fontStyle: 'bold',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 5 }
    }).setOrigin(1, 0); // Lo anclamos a la derecha

// 5. MECÁNICA DE NIVEL
    if (itemActual.tipo === "Conteo") {
        this.prepararEscenaConteo(itemActual, indexActual);
    } 
    else if (itemActual.tipo === "Calculo") { 
        this.prepararEscenaCalculo(itemActual, indexActual);
    } 
    else {
        this.prepararEscenaMagnitud(itemActual, indexActual);
    }
}

   prepararEscenaConteo(itemActual, indexActual) {
    this.contadorGalletas = 0;
    this.erroresEnNivel = 0; // Para tu API

    // Fondo y Mostrador (puedes usar tu imagen de mostrador.png)
    const mostrador = this.add.image(400, 530, 'mostrador').setDisplaySize(600, 220);
    
    this.scoreText = this.add.text(20, 20, `Galletas: 0`, { fontSize: '20px', fill: '#fff' });

    // Crear Galletas (usando tu galleta.png)
    for (let i = 0; i < itemActual.total_disponible; i++) {
        let galleta = this.add.image(100 + (i * 80), 150, 'galleta').setInteractive();
        galleta.setDisplaySize(80, 80);
        this.input.setDraggable(galleta);
        galleta.yaContada = false;
    }

    this.input.on('drag', (p, obj, dx, dy) => { obj.x = dx; obj.y = dy; });

    this.input.on('dragend', (p, obj) => {
        if (obj.y > 475 && !obj.yaContada) {
            obj.yaContada = true;
            this.contadorGalletas++;
            this.scoreText.setText(`Galletas: ${this.contadorGalletas}`);
            obj.disableInteractive();
            obj.setAlpha(0.7);
            // IMPORTANTE: Quitamos el "if" que pasaba de nivel solo
        }
    });

 // CREAMOS EL BOTÓN QUE SIEMPRE SERÁ "SIGUIENTE"
    this.btnAccion = this.add.image(720, 520, 'siguiente').setInteractive();
    this.btnAccion.setScale(0.5);

    this.btnAccion.on('pointerdown', () => {
        this.verificarYPasar(itemActual, indexActual);
    });
}

verificarYPasar(itemActual, indexActual) {
    // 1. SI ES CORRECTO
    if (this.contadorGalletas === itemActual.objetivo) {
        this.feedbackText.setText("¡EXCELENTE TRABAJO!");
        this.feedbackText.setFill('#2ecc71'); // Verde
        
        // DESPUÉS DE 1.5 SEGUNDOS, SALTA AL SIGUIENTE NIVEL
        this.time.delayedCall(1500, () => {
            this.irAlSiguienteNivel(indexActual);
        });

    } else {
        // 2. SI ES INCORRECTO
        this.erroresEnNivel++;
        this.cameras.main.shake(200, 0.01);

        if (this.erroresEnNivel >= 3) {
            // FALLÓ 3 VECES: MENSAJE Y SALTO AUTOMÁTICO
            this.feedbackText.setText("¡BUEN INTENTO!\nSIGUIENTE CLIENTE...");
            this.feedbackText.setFill('#3498db'); // Azul
            
            this.time.delayedCall(2000, () => {
                this.irAlSiguienteNivel(indexActual);
            });
        } else {
            // TODAVÍA TIENE INTENTOS: SOLO MENSAJE Y LIMPIEZA
            this.feedbackText.setText(`¡CASI! INTENTO ${this.erroresEnNivel} DE 3`);
            this.feedbackText.setFill('#e74c3c'); // Rojo
            
            this.time.delayedCall(2000, () => { 
                this.feedbackText.setText(''); 
            });
        }
    }
}

irAlSiguienteNivel(indexActual) {
    const proximoNivel = indexActual + 1;
    const allData = this.cache.json.get('levelData');

    if (allData && proximoNivel < allData.items.length) {
        // 'start' mata la escena actual y limpia los textos viejos
        this.scene.start('GameScene', { levelIndex: proximoNivel });
    } else {
        this.feedbackText.setText("¡TERMINASTE EL DÍA!");
    }
}
prepararEscenaMagnitud(itemActual, indexActual) {
    this.erroresEnNivel = 0;
    this.respuestaSeleccionada = null;

    // Aseguramos que el feedbackText esté limpio y en una buena posición
    this.feedbackText.setText(''); 
    this.feedbackText.setY(200); // Lo bajamos un poco para que no estorbe

    // --- GRUPO A (Izquierda - 5 dulces en cuadrícula) ---
    const grupoA = this.add.container(250, 420); // Subimos un poco el grupo
    
    // Cuadrícula compacta (2 columnas x 3 filas)
    for (let i = 0; i < itemActual.opcionA; i++) {
        let x = (i % 2) * 45; // Columnas separadas por 45px
        let y = Math.floor(i / 2) * 45; // Filas separadas por 45px
        
        let d = this.add.image(x, y, 'dulce').setScale(0.25); // Dulces más chiquitos
        grupoA.add(d);
    }
    // Área interactiva para que sea fácil picar el grupo
    grupoA.setSize(100, 140).setInteractive(new Phaser.Geom.Rectangle(0,0,100,140), Phaser.Geom.Rectangle.Contains);

    // --- GRUPO B (Derecha - 2 dulces alineados) ---
    const grupoB = this.add.container(550, 420);
    
    // Cuadrícula compacta (1 columna x 2 filas)
    for (let i = 0; i < itemActual.opcionB; i++) {
        let x = 0; 
        let y = i * 45; 
        
        let d = this.add.image(x, y, 'dulce').setScale(0.25);
        grupoB.add(d);
    }
    grupoB.setSize(100, 140).setInteractive(new Phaser.Geom.Rectangle(0,0,100,140), Phaser.Geom.Rectangle.Contains);

    // --- LÓGICA DE SELECCIÓN ---
    grupoA.on('pointerdown', () => {
        this.respuestaSeleccionada = itemActual.opcionA;
        grupoA.setAlpha(0.5); // Feedback visual
        grupoB.setAlpha(1);
    });

    grupoB.on('pointerdown', () => {
        this.respuestaSeleccionada = itemActual.opcionB;
        grupoB.setAlpha(0.5); 
        grupoA.setAlpha(1);
    });

    // --- BOTÓN SIGUIENTE (Único para todo el juego) ---
    // Usamos 'siguiente' directamente
    this.btnAccion = this.add.image(720, 520, 'siguiente').setInteractive().setScale(0.5);
    
    this.btnAccion.on('pointerdown', () => {
        // Determinamos cuál valor es el mayor
        const correcto = itemActual.opcionA > itemActual.opcionB ? itemActual.opcionA : itemActual.opcionB;
        
        if (this.respuestaSeleccionada === correcto) {
            // ÉXITO
            this.feedbackText.setText("¡Muy bien! Hay más dulces ahí.");
            this.feedbackText.setFill('#2ecc71');
            this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
        } else {
            // ERROR
            this.erroresEnNivel++;
            this.cameras.main.shake(200, 0.01);
            
            // Texto de error corregido y centrado
            this.feedbackText.setText("¿Seguro? Mira bien\ncuál grupo es más grande.");
            this.feedbackText.setFill('#e74c3c');
        }
    });
}
prepararEscenaCalculo(itemActual, indexActual) {
    this.monedasRestantes = itemActual.monedas_dadas; 
    this.erroresEnNivel = 0;

    // --- AJUSTE DE MONEDAS MÁS CHICAS Y REALES ---
    for (let i = 0; i < itemActual.monedas_dadas; i++) {
        // Coordenada X inicial (300) y separación (50px) ajustadas para tamaño menor
        // setScale(0.35) para un tamaño más realista
        let moneda = this.add.image(300 + (i * 50), 490, 'moneda').setScale(0.35).setInteractive();
        
        // Un pequeño toque de inclinación aleatoria para que no se vean "perfectas"
        moneda.setAngle(Phaser.Math.Between(-10, 10));

        moneda.on('pointerdown', () => {
            // Efecto visual al quitar la moneda (se desvanece y sube)
            this.tweens.add({
                targets: moneda,
                y: 440,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    moneda.destroy();
                }
            });
            this.monedasRestantes--;
        });
    }

    // El botón de siguiente que ya tienes configurado
    // Asegúrate de que este botón no tape las monedas (ajustado a y: 530)
    this.btnAccion = this.add.image(720, 530, 'siguiente').setInteractive().setScale(0.5);
    this.btnAccion.on('pointerdown', () => {
        // Si quedan exactamente las monedas del precio, está bien
        if (this.monedasRestantes === itemActual.precio) {
            this.feedbackText.setText("¡EXCELENTE TRABAJO!");
            this.feedbackText.setFill('#2ecc71');
            this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
        } else {
            this.erroresEnNivel++;
            this.cameras.main.shake(200, 0.01); // Un pequeño shake al fallar
            this.feedbackText.setText("Mmm... revisa el cambio.");
            this.feedbackText.setFill('#e74c3c');
            
            // Si falla 3 veces, lo dejamos pasar
            if (this.erroresEnNivel >= 3) {
                this.feedbackText.setText("¡Buen intento!\nProbemos el siguiente.");
                this.feedbackText.setFill('#3498db');
                this.time.delayedCall(2000, () => this.irAlSiguienteNivel(indexActual));
            }
        }
    });
}
}
