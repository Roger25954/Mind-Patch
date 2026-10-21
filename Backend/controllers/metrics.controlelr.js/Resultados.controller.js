const { calcularMetricas } = require('../modules/metrics');

const procesarResultados = (req, res) => {
    try {
        const data = req.body;

        const resultados = calcularMetricas(data);

        return res.json({
            ok: true,
            resultados
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            error: "Error al procesar métricas"
        });
    }
};

module.exports = {
    procesarResultados
};

