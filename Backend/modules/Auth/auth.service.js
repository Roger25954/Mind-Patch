const pool = require('../../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async ({ correo, password, nombre }) => {

    if (!correo || !password || !nombre) {
        throw new Error("Faltan datos obligatorios");
    }

    const existing = await pool.query(
        `SELECT id FROM usuarios WHERE correo = $1`,
        [correo]
    );

    if (existing.rows.length > 0) {
        throw new Error("El usuario ya existe");
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO usuarios (rol_id, nombre, correo, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, correo, nombre`,
        [3, nombre, correo, hash]
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
        { id: newUser.id, correo: newUser.correo },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { user: newUser, token, tiene_perfil: false, tiene_onboarding: false, userType: null };
};

const login = async ({ correo, password }) => {

    if (!correo || !password) {
        throw new Error("Faltan credenciales");
    }

    const result = await pool.query(
        `SELECT * FROM usuarios WHERE correo = $1`,
        [correo]
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    if (!user.password_hash) {
        throw new Error("Este usuario usa login con Google");
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
        throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
        { id: user.id, correo: user.correo },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    const profileResult = await pool.query(
        `SELECT id, preferencias FROM perfiles WHERE usuario_id = $1`,
        [user.id]
    );

    const tiene_perfil    = profileResult.rows.length > 0;
    const preferencias    = profileResult.rows[0]?.preferencias || {};
    const tiene_onboarding = preferencias.onboarding_completado === true;

    return {
        user: {
            id: user.id,
            correo: user.correo,
            nombre: user.nombre
        },
        token,
        tiene_perfil,
        tiene_onboarding,
        userType: preferencias.userType || null,
    };
};

module.exports = { register, login };
