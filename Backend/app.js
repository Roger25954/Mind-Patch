const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

//  Google Auth (AJUSTADO A TU ESTRUCTURA)
require('./modules/Auth/googleAuth');

const app = express();

//  Middlewares básicos
app.use(express.json());

app.use(cors({
    origin: '*', //  en producción cambia esto
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Passport
app.use(passport.initialize());


// Rutas existentes
const indexRoutes = require('./routes/index.routes');
const iaRoutes = require('./routes/IA.routes');
const mapRoutes = require('./routes/Maps.routes');
const resultadosRoutes = require('./routes/Resultados.routes');

// Auth
const authRoutes = require('./routes/auth.routes');


// Uso de rutas
app.use('/api', indexRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/res', resultadosRoutes);

// Auth routes
app.use('/api/auth', authRoutes);


module.exports = app;