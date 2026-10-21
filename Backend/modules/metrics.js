const calcularMetricas = ({ tiempos, aciertos, errores_impulsivos, total }) => {
    const N = tiempos.length;

    // ⏱️ Tiempo promedio
    const promedio = tiempos.reduce((a, b) => a + b, 0) / N;

    // 📊 Desviación estándar
    const varianza = tiempos.reduce((acc, t) => {
        return acc + Math.pow(t - promedio, 2);
    }, 0) / N;

    const desviacion = Math.sqrt(varianza);

    // ✅ Tasa de aciertos
    const tasaAciertos = (aciertos / total) * 100;

    // ⚡ Tasa de impulsividad
    const tasaImpulsividad = (errores_impulsivos / total) * 100;

    return {
        tiempo_promedio: promedio,
        desviacion_estandar: desviacion,
        tasa_aciertos: tasaAciertos,
        tasa_impulsividad: tasaImpulsividad
    };
};

module.exports = {
    calcularMetricas
};

