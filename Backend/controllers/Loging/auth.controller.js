const { register, login } = require('../../modules/Auth/auth.service');

const registerUser = async (req, res) => {
    try {
        const user = await register(req.body);
        res.json({ ok: true, user });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const data = await login(req.body);
        res.json({ ok: true, ...data });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};