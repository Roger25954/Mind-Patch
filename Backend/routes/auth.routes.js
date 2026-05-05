const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

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
    (req, res) => {

        const token = jwt.sign(
            { id: req.user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Envía el token al popup del frontend y lo cierra
        res.send(`
            <script>
                window.opener.postMessage(
                    { type: 'GOOGLE_AUTH_SUCCESS', token: '${token}', user: ${JSON.stringify(req.user)} },
                    '*'
                );
                window.close();
            </script>
        `);
    }
);

module.exports = router;