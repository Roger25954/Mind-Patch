require('dotenv').config();
const pool = require('./config/db');

const inicializarDirectorio = async () => {
    try {
        console.log('⏳ Creando la tabla de especialistas...');

        // 1. Creamos la tabla
        await pool.query(`
            CREATE TABLE IF NOT EXISTS especialistas (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                especialidad VARCHAR(150) NOT NULL,
                ubicacion VARCHAR(255) NOT NULL,
                contacto VARCHAR(150) NOT NULL
            );
        `);

        // 2. Insertamos dos especialistas de prueba
        await pool.query(`
            INSERT INTO especialistas (nombre, especialidad, ubicacion, contacto) 
            VALUES 
            ('Dra. Elena Ramos', 'Neuropsicología Pediátrica', 'Ciudad de México', 'elena.ramos@mindpatch.com'),
            ('Dr. Carlos Ruiz', 'Psicología Clínica', 'Guadalajara', 'carlos.ruiz@mindpatch.com')
        `);

        console.log('✅ Directorio médico creado y poblado exitosamente.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        pool.end();
    }
};

inicializarDirectorio();
