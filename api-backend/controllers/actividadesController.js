const pool = require('../config/db');

const generarPlan = async (req, res) => {
    try {
        // Recibimos de qué evaluación queremos generar el plan
        const { id_evaluacion } = req.body;
        const idUsuarioLogueado = req.usuario.id;

        // 1. Buscamos el perfil cognitivo que generó la IA
        const consulta = await pool.query(
            'SELECT perfil FROM evaluaciones WHERE id = $1 AND id_usuario = $2',
            [id_evaluacion, idUsuarioLogueado]
        );

        if (consulta.rows.length === 0 || !consulta.rows[0].perfil) {
            return res.status(404).json({ error: 'No se encontró un perfil de IA para esta evaluación.' });
        }

        const perfilIA = consulta.rows[0].perfil;

        // 2. Lógica del Motor Adaptativo (Simplificada para el ejemplo)
        // Aquí tu sistema leería las "fortalezas" y "áreas para fortalecer" 
        // y armaría este JSON dinámicamente. Por ahora, construiremos la 
        // estructura oficial que pide tu documento técnico.

        const planGenerado = {
            id_usuario: idUsuarioLogueado,
            fecha_generacion: new Date().toISOString().split('T')[0],
            plan_actividades: [
                {
                    nombre: "Foco Visual",
                    frecuencia_sugerida: "3 veces por semana",
                    duracion_minutos: 8,
                    parametros_iniciales: {
                        velocidad_estimulos: "media",
                        nivel_dificultad: 2,
                        cantidad_distractores: 2
                    }
                },
                {
                    nombre: "Secuencia de Memoria",
                    frecuencia_sugerida: "4 veces por semana",
                    duracion_minutos: 5,
                    parametros_iniciales: {
                        longitud_secuencia: 4
                    }
                }
            ]
        };

        // 3. Respondemos con el plan listo para que el Frontend (Phaser) configure los juegos
        res.status(201).json({
            mensaje: '✅ Plan de actividades generado exitosamente',
            plan: planGenerado
        });

    } catch (error) {
        console.error('Error al generar plan:', error.message);
        res.status(500).json({ error: 'Hubo un problema al generar el plan de actividades.' });
    }
};

module.exports = { generarPlan };
