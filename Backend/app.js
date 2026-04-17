const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors(
    {
        origin: '*', //['http://localhost:5173','http://127.0.0.1:5500/'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));



const indexRoutes = require('./routes/index.routes');
const iaRoutes = require('./routes/ia.routes');
const mapRoutes = require('./routes/Maps.routes');
const resultadosRoutes = require('./routes/Resultados.routes');

app.use('/api', indexRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/maps',mapRoutes);
app.use('/api/res', resultadosRoutes);

module.exports = app;