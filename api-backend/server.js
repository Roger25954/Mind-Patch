// 1. Cargamos las variables secretas del archivo .env ANTES que cualquier otra cosa
require('dotenv').config();

// 2. Iniciamos la conexión a la base de datos
require('./config/db');

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());

// Usamos el puerto del .env, o el 3000 si no lo encuentra
const PUERTO = process.env.PUERTO || 3000; 

const rutasAuth = require('./routes/authRoutes');
app.use('/api/auth', rutasAuth);

const rutasEvaluaciones = require('./routes/evaluacionesRoutes');
app.use('/api/evaluaciones', rutasEvaluaciones);

// Conectamos el módulo de actividades
const rutasActividades = require('./routes/actividadesRoutes');
app.use('/api/actividades', rutasActividades);

// Conectamos el módulo del directorio médico
const rutasEspecialistas = require('./routes/especialistasRoutes');
app.use('/api/especialistas', rutasEspecialistas);

// Iniciamos el servidor
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor iniciado correctamente en http://localhost:${PUERTO}`);
});
