import express from 'express';
const router = express.Router();

export default (db) => {

    // --- Rute Proses Login ---
    router.post('/auth-login', (req, res) => {
        const { username, password } = req.body;
        db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Terjadi kesalahan database." });
            }
            if (results.length > 0) {
                req.session.isAdmin = true;
                res.json({ success: true, message: "Login Berhasil!" });
            } else {
                res.status(401).json({ success: false, message: "Username atau Password Salah!" });
            }
        });
    });

    // --- Rute Logout ---
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    });

    // --- Rute Cek Status Login (API) ---
    router.get('/api/user-status', (req, res) => {
        res.json({ isLoggedIn: req.session.isAdmin || false });
    });

    return router;
};