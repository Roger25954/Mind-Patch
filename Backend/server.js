require("dotenv").config();

const app = require('./app');

const pool = require('./db');

const PORT = process.env.PORT || 3000;

// 🔌 Conectar a PostgreSQL
pool.connect()
.then(() => {
    console.log("Conectado a PostgreSQL");

    app.listen(PORT, () => {
        console.log(` Servidor corriendo en puerto ${PORT}`);
        console.log(`API disponible en http://localhost:${PORT}/api`);
    });
})
.catch(err => {
    console.error("Error al conectar a DB:", err);
});