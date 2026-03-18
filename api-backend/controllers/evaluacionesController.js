const pool = require('../config/db');

// Función 1: Guardar (La que hicimos en el paso anterior)
const guardarEvaluacion = async (req, res) => {
    // ... tu código anterior se queda igual ...
};

// Obtener un resultado específico
const obtenerResultado = async (req, res) => {
    try {
        // 1. ¿Qué evaluación buscamos? (Viene en la URL, ej: /api/resultados/5)
        const idEvaluacion = req.params.id;
        
        // 2. ¿Quién la está pidiendo? (Nos lo dice el gafete/token JWT)
        const idUsuarioLogueado = req.usuario.id;

        // 3. Buscamos en la base de datos aplicando la regla de privacidad
        const consulta = await pool.query(
            'SELECT * FROM evaluaciones WHERE id = $1 AND id_usuario = $2',
            [idEvaluacion, idUsuarioLogueado]
        );

        // 4. Si no hay resultados, puede que no exista o que no sea suyo
        if (consulta.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluación no encontrada o no tienes permisos para verla.' });
        }

        // 5. Si todo está bien, le entregamos el reporte
        res.status(200).json({
            mensaje: 'Reporte obtenido exitosamente',
            evaluacion: consulta.rows[0]
        });

    } catch (error) {
        console.error('Error al obtener resultado:', error.message);
        res.status(500).json({ error: 'Hubo un problema al buscar la evaluación.' });
    }
};

// Exportamos ambas funciones
module.exports = {
    guardarEvaluacion,
    obtenerResultado // <-- No olvides agregar esto
};
