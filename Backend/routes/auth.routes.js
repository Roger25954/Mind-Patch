const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const pool = require('../../db');
const { verificarToken } = require('../middleware/auth.middleware');

// IMPORTAR CONTROLLER (no service)
const { registerUser, loginUser } = require('../controllers/Loging/auth.controller');


//  Auth normal
router.post('/register', registerUser);
router.post('/login', loginUser);


//  Google login
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user.id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            const profileResult = await pool.query(
                'SELECT id, preferencias FROM perfiles WHERE usuario_id = $1',
                [req.user.id]
            );
            const tiene_perfil     = profileResult.rows.length > 0;
            const preferencias     = profileResult.rows[0]?.preferencias || {};
            const tiene_onboarding = preferencias.onboarding_completado === true;
            const userType         = preferencias.userType || null;

            const payload = JSON.stringify({
                type: 'GOOGLE_AUTH_SUCCESS',
                token,
                tiene_perfil,
                tiene_onboarding,
                userType,
                user: { nombre: req.user.nombre, foto: req.user.foto || null },
            });

            res.send(`<script>window.opener.postMessage(${payload},'*');window.close();</script>`);
        } catch {
            res.send('<script>window.close();</script>');
        }
    }
);

// Guardar edad del usuario (primer inicio)
router.post('/profile/age', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const edadNum = parseInt(req.body.edad, 10);

        if (!edadNum || edadNum < 5 || edadNum > 120) {
            return res.status(400).json({ error: 'Edad inválida' });
        }

        const es_menor = edadNum < 18;

        await pool.query(
            `INSERT INTO perfiles (usuario_id, edad, preferencias)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (usuario_id) DO UPDATE
             SET edad = $2, preferencias = $3::jsonb`,
            [userId, edadNum, JSON.stringify({ es_menor })]
        );

        res.json({ ok: true, es_menor });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Guardar datos completos del onboarding (3 pasos)
router.post('/profile/onboarding', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { userType, tutorName, tutorRel, age, gender, education, job, reason, sleep, anxiety, attention } = req.body;

        const edadNum = parseInt(age, 10) || null;
        const es_menor = edadNum ? edadNum < 18 : false;

        const preferencias = {
            es_menor,
            onboarding_completado: true,
            userType:   userType   || null,
            tutorName:  tutorName  || null,
            tutorRel:   tutorRel   || null,
            gender:     gender     || null,
            education:  education  || null,
            job:        job        || null,
            reason:     reason     || null,
            sleep:      sleep      ?? null,
            anxiety:    anxiety    ?? null,
            attention:  attention  ?? null,
        };

        await pool.query(
            `INSERT INTO perfiles (usuario_id, edad, preferencias)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (usuario_id) DO UPDATE
             SET edad = COALESCE($2, perfiles.edad), preferencias = $3::jsonb`,
            [userId, edadNum, JSON.stringify(preferencias)]
        );

        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;