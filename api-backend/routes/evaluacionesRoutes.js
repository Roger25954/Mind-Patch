const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluacionesController');
const verificarToken = require('../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

// Para guardar nuevas métricas
router.post('/', verificarToken, evaluacionesController.guardarEvaluacion);

// Para consultar una evaluación por su ID
// Los dos puntos (:id) indican que será un número dinámico
router.get('/:id', verificarToken, evaluacionesController.obtenerResultado);

module.exports = router;

// Ruta para pedirle a la IA que analice una evaluación específica
router.post('/:id/analizar', verificarToken, aiController.analizarConIA);
