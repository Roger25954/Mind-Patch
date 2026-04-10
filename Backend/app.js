const express = require('express');
const app = express();

app.use(express.json());

const indexRoutes = require('./routes/index.routes');

app.use('/api', indexRoutes);

module.exports = app;