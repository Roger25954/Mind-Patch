const express = require('express');
const router = express.Router();

// 👇 importa tu función real
const { getNearbyPsychologists } = require('../controllers/Maps/Maps.controller');

// 👇 endpoint real
router.get('/psychologists', getNearbyPsychologists);

// (opcional) ruta de prueba
router.get('/', (req, res) => {
    res.json({
        message: 'API de Maps funcionando correctamente'
    });
});

module.exports = router;