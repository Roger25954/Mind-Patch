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

        res.json({ user: req.user, token });
    }
);

module.exports = router;