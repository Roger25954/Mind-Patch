const pool = require('../config/db');

const obtenerDirectorio = async (req, res) => {
    try {
        // Consultamos todos los especialistas registrados
        const consulta = await pool.query('SELECT * FROM especialistas');

        res.status(200).json({
            mensaje: 'Directorio obtenido exitosamente',
            total: consulta.rows.length,
            especialistas: consulta.rows
        });
    } catch (error) {
        console.error('Error al obtener directorio:', error.message);
        res.status(500).json({ error: 'Hubo un problema al cargar el directorio médico.' });
    }
};

module.exports = { obtenerDirectorio };
