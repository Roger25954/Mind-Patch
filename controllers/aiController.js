const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');

// Inicializamos la conexión con Gemini usando la llave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analizarConIA = async (req, res) => {
    try {
        const idEvaluacion = req.params.id;
        const idUsuarioLogueado = req.usuario.id;

        // 1. Extraemos SOLO las métricas (Anonimización: No enviamos nombre ni correo)
        const consulta = await pool.query(
            'SELECT metricas FROM evaluaciones WHERE id = $1 AND id_usuario = $2',
            [idEvaluacion, idUsuarioLogueado]
        );

        if (consulta.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluación no encontrada.' });
        }

        const metricasCrudas = consulta.rows[0].metricas;

        // 2. Preparamos el modelo de IA (gemini-1.5-flash es ultra rápido e ideal para texto/JSON)
        const modelo = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });       
        
        // 3. Construimos el Prompt Estructurado (Orquestación)
        const prompt = `
        Actúa como un motor de análisis de desempeño. Analiza las siguientes métricas de un minijuego de "Foco Visual":
        ${JSON.stringify(metricasCrudas)}

        REGLA ESTRICTA 1: NO emitas diagnósticos clínicos bajo ninguna circunstancia. Solo describe tendencias de atención y regulación.
        REGLA ESTRICTA 2: Devuelve la respuesta ÚNICAMENTE en formato JSON válido con esta estructura exacta:
        {
          "tipo_usuario": "menor",
          "perfil_observado": {
            "fortalezas": ["escribe una o dos aquí"],
            "areas_para_fortalecer": ["escribe una o dos aquí"]
          },
          "tendencias_identificadas": {
            "atencion": "descripción breve",
            "regulacion": "descripción breve"
          },
          "nota_etica": "Este análisis constituye un perfil orientativo basado en interacciones digitales y no debe ser considerado un diagnóstico clínico."
        }
        `;

        // 4. Enviamos la instrucción a Gemini y esperamos la respuesta
        console.log('⏳ Enviando datos anonimizados a Gemini...');
        const resultadoIA = await modelo.generateContent(prompt);
        let textoRespuesta = resultadoIA.response.text();

        // 5. Limpiamos el texto por si Gemini le añade marcas de formato Markdown (```json)
        textoRespuesta = textoRespuesta.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Convertimos el texto a un objeto JSON real de JavaScript
        const perfilJSON = JSON.parse(textoRespuesta);

        // 6. Guardamos este análisis en la columna "perfil" de nuestra base de datos
        await pool.query(
            'UPDATE evaluaciones SET perfil = $1 WHERE id = $2',
            [perfilJSON, idEvaluacion]
        );

        // 7. Le devolvemos el resultado al usuario
        res.status(200).json({
            mensaje: '✅ Análisis de IA completado y guardado',
            perfil_cognitivo: perfilJSON
        });

    } catch (error) {
        console.error('❌ Error en el Motor de IA:', error);
        res.status(500).json({ error: 'Hubo un error al procesar el análisis con Inteligencia Artificial.' });
    }
};

module.exports = { analizarConIA };
