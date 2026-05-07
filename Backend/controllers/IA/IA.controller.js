const { analizarPdf } = require("../../modules/LangChain/documentos");
const { enviarMensaje } = require("../../modules/LangChain/index");

// Extrae el primer bloque JSON válido de un string
function extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
}

exports.procesarIA = async (req, res) => {
    try {
        const prompt  = req.body.prompt;
        const mensaje = req.body.mensaje;
        const tool    = req.body.tool;

        if (req.file) {
            const promptFinal = tool === "tarjetas"
                ? `${prompt || "Analiza este documento"}\n\nIMPORTANTE: Responde SOLO con JSON válido sin texto extra:\n{"tarjetas":[{"pregunta":"...","respuesta":"..."}]}\nGenera entre 5 y 8 tarjetas.`
                : (prompt || "Analiza este documento");

            const resultado = await analizarPdf(req.file.buffer, promptFinal);

            if (tool === "tarjetas") {
                const parsed = extractJSON(resultado);
                if (parsed?.tarjetas) {
                    return res.json({ tipo: "tarjetas", tarjetas: parsed.tarjetas });
                }
            }

            return res.json({ tipo: "pdf", resultado });
        }

        if (mensaje) {
            if (tool === "tarjetas") {
                const promptTarjetas = `${mensaje}\n\nIMPORTANTE: Responde SOLO con JSON válido sin texto extra ni bloques de código:\n{"tarjetas":[{"pregunta":"...","respuesta":"..."}]}\nGenera entre 5 y 8 tarjetas didácticas claras y concisas.`;
                const raw = await enviarMensaje(promptTarjetas);
                const parsed = extractJSON(raw);
                if (parsed?.tarjetas) {
                    return res.json({ tipo: "tarjetas", tarjetas: parsed.tarjetas });
                }
                return res.json({ tipo: "chat", respuesta: raw });
            }

            if (tool === "quiz") {
                const promptQuiz = `${mensaje}\n\nIMPORTANTE: Responde SOLO con JSON válido sin texto extra ni bloques de código:\n{"preguntas":[{"pregunta":"...","opciones":["...","...","...","..."],"correcta":0,"explicacion":"..."}]}\nEl campo "correcta" es el índice (0-3) de la opción correcta. Genera entre 4 y 6 preguntas de opción múltiple con exactamente 4 opciones cada una. La explicación debe ser breve (1-2 oraciones).`;
                const raw = await enviarMensaje(promptQuiz);
                const parsed = extractJSON(raw);
                if (parsed?.preguntas) {
                    return res.json({ tipo: "quiz", preguntas: parsed.preguntas });
                }
                return res.json({ tipo: "chat", respuesta: raw });
            }

            const respuesta = await enviarMensaje(mensaje);
            return res.json({ tipo: "chat", respuesta });
        }

        return res.status(400).json({ error: "Debes enviar mensaje o archivo" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};