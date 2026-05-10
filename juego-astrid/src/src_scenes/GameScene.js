export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create(data) {
        const indexActual = data.levelIndex || 0;
        const allData = this.cache.json.get('levelData');
        const itemActual = allData.items[indexActual];

        // Fondo
        const imagenFondo = this.add.image(400, 300, 'fondo');
        imagenFondo.setDisplaySize(800, 600); 

        // Monstruo y Mostrador
        const keysMonstruos = ['mounstro_1', 'mounstro_2', 'mounstro_3'];
        const monstruoActual = keysMonstruos[indexActual % 3];
        this.add.image(400, 380, monstruoActual).setDisplaySize(280, 280); 
        this.add.image(400, 530, 'mostrador').setDisplaySize(600, 220); 

        // Instrucción
        this.instruccionText = this.add.text(400, 85, itemActual.mensaje, { 
            fontSize: '28px', fill: '#2c3e50', fontStyle: 'bold', 
            backgroundColor: '#ffffffcc', padding: {x: 20, y: 10},
            wordWrap: { width: 700 }, align: 'center'
        }).setOrigin(0.5);

        // Feedback
        this.feedbackText = this.add.text(400, 220, '', {
            fontSize: '34px', fontStyle: 'bold',
            stroke: '#ffffff', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5);

        // --- MÉTRICAS: Tiempos base ---
        this.tiempoInicioNivel = this.time.now;
        this.tiempoPrimerToque = 0; // Para medir latencia de respuesta

        if (itemActual.tipo === "Conteo") {
            this.prepararEscenaConteo(itemActual, indexActual);
        } else if (itemActual.tipo === "Calculo") { 
            this.prepararEscenaCalculo(itemActual, indexActual);
        } else {
            this.prepararEscenaMagnitud(itemActual, indexActual);
        }
    }

    // --- MÉTRICAS: Registro expandido para diagnóstico ---
    registrarDatosNivel(itemActual, acerto, metricasExtra = {}) {
        const tiempoFinal = this.time.now;
        const duracionMs = tiempoFinal - this.tiempoInicioNivel;
        const latenciaMs = this.tiempoPrimerToque ? (this.tiempoPrimerToque - this.tiempoInicioNivel) : duracionMs;
        
        const numNivel = parseInt(itemActual.id.split('_')[1]);

        const resultado = {
            id: itemActual.id,
            fase: numNivel >= 30 ? "Simbólica" : "Gráfica",
            tipo: itemActual.tipo,
            acierto: acerto ? "Sí" : "No",
            errores_cometidos: this.erroresEnNivel,
            tiempo_resolucion_ms: duracionMs,
            latencia_primer_toque_ms: latenciaMs, // Mide bloqueo o ansiedad
            ...metricasExtra
        };

        if (!this.game.reporteJSON) this.game.reporteJSON = [];
        this.game.reporteJSON.push(resultado);
    }

    descargarJSON() {
        const reporte = {
            fecha: new Date().toLocaleString(),
            resumen: {
                total_items: this.game.reporteJSON.length,
                aciertos: this.game.reporteJSON.filter(r => r.acierto === "Sí").length
            },
            resultados: this.game.reporteJSON || []
        };
        const blob = new Blob([JSON.stringify(reporte, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagnostico_discalculia_${Date.now()}.json`;
        a.click();
    }

    prepararEscenaConteo(itemActual, indexActual) {
        this.erroresEnNivel = 0;
        const numNivel = parseInt(itemActual.id.split('_')[1]);

        if (numNivel >= 30) {
            let incorrecta = (itemActual.objetivo < 5) ? itemActual.objetivo + 1 : itemActual.objetivo - 1;
            let opciones = [itemActual.objetivo, incorrecta];
            Phaser.Utils.Array.Shuffle(opciones);

            opciones.forEach((val, i) => {
                let txt = this.add.text(200 + (i * 400), 280, val, {
                    fontSize: '220px', fill: '#8e44ad', fontStyle: 'bold', fontFamily: 'Verdana'
                }).setOrigin(0.5).setInteractive();

                txt.on('pointerdown', () => {
                    if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now;

                    if (val === itemActual.objetivo) {
                        txt.setFill('#2ecc71');
                        this.feedbackText.setText("¡MUY BIEN!").setFill('#2ecc71');
                        this.registrarDatosNivel(itemActual, true, { valor_objetivo: itemActual.objetivo, valor_seleccionado: val });
                        this.time.delayedCall(1000, () => this.irAlSiguienteNivel(indexActual));
                    } else {
                        this.erroresEnNivel++;
                        txt.setFill('#e74c3c');
                        this.feedbackText.setText("INTENTA EL OTRO").setFill('#e74c3c');
                        this.cameras.main.shake(100, 0.005);
                    }
                });
            });
        } else {
            this.contadorEntrega = 0;
            let imgKey = 'galleta';
            let tamaño = 80;
            const mensajeMin = itemActual.mensaje.toLowerCase();
            if (mensajeMin.includes('pastel')) { imgKey = 'cake'; tamaño = 120; } 
            else if (mensajeMin.includes('dulce')) { imgKey = 'dulce'; tamaño = 75; } 
            else if (mensajeMin.includes('paleta')) { imgKey = 'paleta'; tamaño = 90; }

            this.scoreText = this.add.text(20, 20, `Contador: 0`, { fontSize: '24px', fill: '#fff' });

            const crearObjetos = () => {
                if (this.grupoObjetos) this.grupoObjetos.destroy(true);
                this.grupoObjetos = this.add.group();
                this.contadorEntrega = 0;
                this.scoreText.setText(`Contador: 0`);
                for (let i = 0; i < itemActual.total_disponible; i++) {
                    let xPos = 100 + (i * 90);
                    let yPos = 150;
                    let obj = this.add.image(xPos, yPos, imgKey).setInteractive().setDisplaySize(tamaño, tamaño);
                    obj.setData({ x: xPos, y: yPos });
                    this.input.setDraggable(obj);
                    obj.entregado = false;
                    this.grupoObjetos.add(obj);
                }
            };
            crearObjetos();

            this.input.on('dragstart', () => { if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now; });
            this.input.on('drag', (p, obj, dx, dy) => { obj.x = dx; obj.y = dy; });
            this.input.on('dragend', (p, obj) => {
                if (obj.y > 475) {
                    if (!obj.entregado) {
                        obj.entregado = true;
                        this.contadorEntrega++;
                        this.scoreText.setText(`Contador: ${this.contadorEntrega}`);
                        obj.setAlpha(0.8);
                    }
                } else {
                    if (obj.entregado) {
                        obj.entregado = false;
                        this.contadorEntrega--;
                        this.scoreText.setText(`Contador: ${this.contadorEntrega}`);
                        obj.setAlpha(1);
                    }
                    obj.x = obj.getData('x');
                    obj.y = obj.getData('y');
                }
            });

            this.btnAccion = this.add.image(720, 520, 'siguiente').setInteractive().setScale(0.5);
            this.btnAccion.on('pointerdown', () => {
                if (this.contadorEntrega === itemActual.objetivo) {
                    this.feedbackText.setText("¡MUY BIEN!").setFill('#2ecc71');
                    this.registrarDatosNivel(itemActual, true, { delta_error: 0, cantidad_entregada: this.contadorEntrega });
                    this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
                } else {
                    this.erroresEnNivel++;
                    this.feedbackText.setText(`INTENTO ${this.erroresEnNivel}`).setFill('#e74c3c');
                    if (this.erroresEnNivel >= 3) {
                        this.registrarDatosNivel(itemActual, false, { delta_error: this.contadorEntrega - itemActual.objetivo, cantidad_final: this.contadorEntrega });
                        this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
                    } else {
                        this.time.delayedCall(1000, () => { this.feedbackText.setText(''); crearObjetos(); });
                    }
                }
            });
        }
    }

    prepararEscenaMagnitud(itemActual, indexActual) {
        this.erroresEnNivel = 0;
        this.respuestaSeleccionada = null;
        const numNivel = parseInt(itemActual.id.split('_')[1]);

        // Métrica Distance Ratio (Crítica para Discalculia)
        const ratio = (Math.abs(itemActual.opcionA - itemActual.opcionB) / Math.max(itemActual.opcionA, itemActual.opcionB)).toFixed(2);

        if (numNivel >= 30) {
            const opciones = [{ valor: itemActual.opcionA, x: 200 }, { valor: itemActual.opcionB, x: 600 }];
            opciones.forEach(opc => {
                let txt = this.add.text(opc.x, 280, opc.valor, {
                    fontSize: '220px', fill: '#8e44ad', fontStyle: 'bold', fontFamily: 'Verdana'
                }).setOrigin(0.5).setInteractive();

                txt.on('pointerdown', () => {
                    if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now;
                    const esMayor = itemActual.mensaje.toLowerCase().includes('mayor') || itemActual.mensaje.toLowerCase().includes('grande');
                    const correcto = esMayor ? Math.max(itemActual.opcionA, itemActual.opcionB) : Math.min(itemActual.opcionA, itemActual.opcionB);

                    if (opc.valor === correcto) {
                        txt.setFill('#2ecc71');
                        this.feedbackText.setText("¡CORRECTO!").setFill('#2ecc71');
                        this.registrarDatosNivel(itemActual, true, { distance_ratio: ratio, opcA: itemActual.opcionA, opcB: itemActual.opcionB });
                        this.time.delayedCall(1000, () => this.irAlSiguienteNivel(indexActual));
                    } else {
                        this.erroresEnNivel++;
                        this.feedbackText.setText("¡INTENTA EL OTRO!").setFill('#e74c3c');
                        txt.setFill('#e74c3c');
                        this.time.delayedCall(800, () => { if(txt.active) txt.setFill('#8e44ad'); });
                    }
                });
            });
        } else {
            // Fase Gráfica Magnitud (Simplificada)
            this.feedbackText.setText('').setY(200);
            const grupoA = this.add.container(250, 420);
            for (let i = 0; i < itemActual.opcionA; i++) {
                grupoA.add(this.add.image((i % 2) * 45, Math.floor(i / 2) * 45, 'dulce').setScale(0.25));
            }
            grupoA.setSize(100, 140).setInteractive(new Phaser.Geom.Rectangle(0,0,100,140), Phaser.Geom.Rectangle.Contains);

            const grupoB = this.add.container(550, 420);
            for (let i = 0; i < itemActual.opcionB; i++) {
                grupoB.add(this.add.image((i % 2) * 45, Math.floor(i / 2) * 45, 'dulce').setScale(0.25));
            }
            grupoB.setSize(100, 140).setInteractive(new Phaser.Geom.Rectangle(0,0,100,140), Phaser.Geom.Rectangle.Contains);

            grupoA.on('pointerdown', () => { if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now; this.respuestaSeleccionada = itemActual.opcionA; grupoA.setAlpha(0.5); grupoB.setAlpha(1); });
            grupoB.on('pointerdown', () => { if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now; this.respuestaSeleccionada = itemActual.opcionB; grupoB.setAlpha(0.5); grupoA.setAlpha(1); });

            this.btnAccion = this.add.image(720, 520, 'siguiente').setInteractive().setScale(0.5);
            this.btnAccion.on('pointerdown', () => {
                const esMas = itemActual.mensaje.toLowerCase().includes('más') || itemActual.mensaje.toLowerCase().includes('mas');
                const correcto = esMas ? Math.max(itemActual.opcionA, itemActual.opcionB) : Math.min(itemActual.opcionA, itemActual.opcionB);
                if (this.respuestaSeleccionada === correcto) {
                    this.feedbackText.setText("¡Muy bien!").setFill('#2ecc71');
                    this.registrarDatosNivel(itemActual, true, { distance_ratio: ratio });
                    this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
                } else {
                    this.erroresEnNivel++;
                    this.cameras.main.shake(200, 0.01);
                }
            });
        }
    }

    prepararEscenaCalculo(itemActual, indexActual) {
        this.erroresEnNivel = 0;
        const numNivel = parseInt(itemActual.id.split('_')[1]);

        if (numNivel >= 30) {
            let opciones = [itemActual.precio, itemActual.precio + 2];
            Phaser.Utils.Array.Shuffle(opciones);
            opciones.forEach((val, i) => {
                let txt = this.add.text(200 + (i * 400), 280, val, {
                    fontSize: '220px', fill: '#8e44ad', fontStyle: 'bold', fontFamily: 'Verdana'
                }).setOrigin(0.5).setInteractive();

                txt.on('pointerdown', () => {
                    if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now;
                    if (val === itemActual.precio) {
                        txt.setFill('#2ecc71');
                        this.registrarDatosNivel(itemActual, true, { tipo_calculo: "Simbólico", precio: itemActual.precio });
                        this.time.delayedCall(1000, () => this.irAlSiguienteNivel(indexActual));
                    } else {
                        this.erroresEnNivel++;
                        txt.setFill('#e74c3c');
                    }
                });
            });
        } else {
            const actualizarMonedas = () => {
                if (this.monedasGroup) this.monedasGroup.destroy(true);
                this.monedasGroup = this.add.group();
                this.monedasRestantes = itemActual.monedas_dadas;
                for (let i = 0; i < itemActual.monedas_dadas; i++) {
                    let m = this.add.image(200 + (i * 70), 500, 'moneda').setScale(0.4).setInteractive();
                    m.on('pointerdown', () => { if (!this.tiempoPrimerToque) this.tiempoPrimerToque = this.time.now; m.destroy(); this.monedasRestantes--; });
                    this.monedasGroup.add(m);
                }
            };
            actualizarMonedas();

            this.btnAccion = this.add.image(720, 520, 'siguiente').setInteractive().setScale(0.5);
            this.btnAccion.on('pointerdown', () => {
                if (this.monedasRestantes === itemActual.precio) {
                    this.feedbackText.setText("¡PAGO CORRECTO!").setFill('#2ecc71');
                    this.registrarDatosNivel(itemActual, true, { delta_calculo: 0 });
                    this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
                } else {
                    this.erroresEnNivel++;
                    if (this.erroresEnNivel >= 3) {
                        this.registrarDatosNivel(itemActual, false, { delta_calculo: this.monedasRestantes - itemActual.precio });
                        this.time.delayedCall(1500, () => this.irAlSiguienteNivel(indexActual));
                    } else {
                        actualizarMonedas();
                    }
                }
            });
        }
    }

    irAlSiguienteNivel(indexActual) {
        const allData = this.cache.json.get('levelData');
        if (indexActual + 1 < allData.items.length) {
            this.scene.start('GameScene', { levelIndex: indexActual + 1 });
        } else {
            this.feedbackText.setText("¡SESIÓN TERMINADA!").setFill('#2ecc71').setY(300);
            this.time.delayedCall(2000, () => {
                this.descargarJSON();
                // Enviar métricas a la app principal si el juego está en un iframe
                try {
                    const reporte = {
                        fecha: new Date().toLocaleString(),
                        resumen: {
                            total_items: this.game.reporteJSON.length,
                            aciertos: this.game.reporteJSON.filter(r => r.acierto === 'Sí').length,
                        },
                        resultados: this.game.reporteJSON || [],
                    };
                    window.parent.postMessage(
                        { type: 'MINDPATCH_GAME_COMPLETE', gameId: 'juego-astrid', metrics: reporte },
                        '*'
                    );
                } catch (_) {}
            });
        }
    }
}