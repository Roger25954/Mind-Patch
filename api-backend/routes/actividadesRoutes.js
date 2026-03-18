const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta POST oficial según tu documentación para generar el plan
router.post('/plan', verificarToken, actividadesController.generarPlan);

module.exports = router;
