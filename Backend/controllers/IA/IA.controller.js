const { analizarPdf } = require("../../modules/LangChain/documentos");
const { enviarMensaje } = require("../../modules/LangChain/index");

exports.procesarIA = async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const mensaje = req.body.mensaje;

        if (req.file) {
            const resultado = await analizarPdf(
                req.file.buffer,
                prompt || "Analiza este documento"
            );

            return res.json({
                tipo: "pdf",
                resultado
            });
        }

        if (mensaje) {
            const respuesta = await enviarMensaje(mensaje);

            return res.json({
                tipo: "chat",
                respuesta
            });
        }

        return res.status(400).json({
            error: "Debes enviar mensaje o archivo"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};