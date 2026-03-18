const pool = require('../config/db');

// Importamos la librería para crear los tokens
const jwt = require('jsonwebtoken');

// Función de login actualizada
const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Buscamos al usuario en la base de datos de PostgreSQL
        const resultado = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1 AND password = $2',
            [correo, password]
        );

        // 2. Si no lo encuentra, le negamos el acceso
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuarioEncontrado = resultado.rows[0];

        // 3. Fabricamos el Token (Gafete digital)
        // Guardamos dentro del token su ID y su Rol para saber quién es en el futuro
        const token = jwt.sign(
            { 
                id: usuarioEncontrado.id, 
                rol: usuarioEncontrado.rol 
            }, 
            process.env.JWT_SECRET, // Usamos la firma secreta del .env
            { expiresIn: '2h' }     // El token caducará en 2 horas por seguridad
        );

        // 4. Se lo enviamos al usuario
        res.status(200).json({
            mensaje: '✅ Bienvenido a Mind Patch',
            token: token
        });

    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ error: 'Hubo un problema al iniciar sesión' });
    }
};

// 2. NUEVA FUNCIÓN: Registrar un usuario
const register = async (req, res) => {
    try {
        // Extraemos los datos que nos van a enviar desde Thunder Client
        const { nombre, correo, password, rol } = req.body;

        // Le damos la instrucción a PostgreSQL de insertar los datos.
        // Usamos $1, $2... por seguridad, para evitar que nos hackeen la base de datos (Inyección SQL).
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, correo, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, correo, password, rol]
        );

        // Respondemos con éxito y mostramos el usuario que se acaba de crear
        res.status(201).json({
            mensaje: '✅ Usuario creado exitosamente en PostgreSQL',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'Hubo un problema al crear el usuario' });
    }
};

// Exportamos ambas funciones
module.exports = {
    login,
    register
};
