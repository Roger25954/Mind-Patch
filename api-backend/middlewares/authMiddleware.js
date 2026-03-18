const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token que el usuario enviará en los "Headers" de la petición
    const headerAutorizacion = req.header('Authorization');

    if (!headerAutorizacion) {
        return res.status(401).json({ error: 'Acceso denegado. Necesitas iniciar sesión primero.' });
    }

    try {
        // 2. El estándar de internet exige enviar el token como "Bearer hf83h...", así que quitamos la palabra "Bearer "
        const token = headerAutorizacion.split(' ')[1];

        // 3. Usamos nuestra llave secreta del archivo .env para confirmar que el token es auténtico
        const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Extraemos los datos del token (el ID y el rol) y se los pegamos a la petición
        req.usuario = usuarioDecodificado;

        // 5. ¡El token es válido! Le decimos al servidor que continúe (hacia el controlador)
        next();
    } catch (error) {
        res.status(401).json({ error: 'Tu sesión ha expirado o el token es inválido.' });
    }
};

module.exports = verificarToken;
