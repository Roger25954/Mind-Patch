// Importamos la herramienta para conectarnos a Postgres
const { Pool } = require('pg');

// Creamos la conexión usando la URL secreta de nuestro archivo .env
const pool = new Pool({
    connectionString: process.env.URL_BASE_DATOS,
});

// Probamos que la conexión funcione
pool.connect()
    .then(() => console.log('✅ Conexión exitosa a la base de datos PostgreSQL de Mind Patch.'))
    .catch((error) => console.error('❌ Error al conectar con PostgreSQL:', error.message));

// Exportamos la conexión para que los controladores puedan guardar cosas después
module.exports = pool;
