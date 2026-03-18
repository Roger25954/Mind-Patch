const express = require('express');
const router = express.Router();
const especialistasController = require('../controllers/especialistasController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta GET oficial para consultar el directorio
router.get('/', verificarToken, especialistasController.obtenerDirectorio);

module.exports = router;
