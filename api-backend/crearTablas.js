// 1. Cargamos las variables secretas ANTES de intentar conectar
require('dotenv').config();

// 2. Importamos la conexión a la base de datos que creamos en el paso anterior
const pool = require('./config/db');

// Función asíncrona para ejecutar los comandos SQL
const inicializarBaseDeDatos = async () => {
    try {
        console.log('⏳ Creando tablas en PostgreSQL...');

        // 3. Crear la tabla de Usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                correo VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol VARCHAR(20) NOT NULL CHECK (rol IN ('adulto', 'tutor', 'menor')),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla "usuarios" lista.');

        // 4. Crear la tabla de Evaluaciones usando JSONB para las métricas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS evaluaciones (
                id SERIAL PRIMARY KEY,
                id_usuario INTEGER REFERENCES usuarios(id),
                metricas JSONB NOT NULL,
                perfil JSONB,
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla "evaluaciones" lista.');

        console.log('🎉 ¡Estructura de base de datos de Mind Patch completada!');

    } catch (error) {
        console.error('❌ Error al crear las tablas:', error.message);
    } finally {
        // Cerramos la conexión para que la terminal no se quede colgada
        pool.end(); 
    }
};

// Ejecutamos la función
inicializarBaseDeDatos();
