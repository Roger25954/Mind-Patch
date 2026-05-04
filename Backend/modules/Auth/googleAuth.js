const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../../../db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {

    try {
        const correo = profile.emails[0].value;

        let result = await pool.query(
            `SELECT * FROM usuarios WHERE correo = $1`,
            [correo]
        );

        let user = result.rows[0];

        if (!user) {
            result = await pool.query(
                `INSERT INTO usuarios (rol_id, nombre, correo, password_hash)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [3, profile.displayName, correo, 'google']
            );
            user = result.rows[0];
        }

        return done(null, user);

    } catch (err) {
        return done(err, null);
    }
}));