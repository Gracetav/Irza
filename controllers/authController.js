const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login - MotoParts', error: null });
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.render('login', { title: 'Login', error: 'Invalid Email/Password' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { title: 'Login', error: 'Invalid Email/Password' });
        }
        req.session.user = { id: user.id, name: user.name, role: user.role };
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getRegister = (req, res) => {
    res.render('register', { title: 'Register - MotoParts', error: null });
};

exports.postRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.render('register', { title: 'Register', error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};
